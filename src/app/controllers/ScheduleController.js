import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import File from '../models/File';
import Schedules from '../models/Schedules';

class ScheduleController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const Scheduless = await Schedules.findAll({
      where: { patient_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(Scheduless);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create Schedules with providers' });
    }

    if (provider_id === req.userId) {
      return res.status(401).json({ error: "Provider and user can't equals" });
    }

    /* check for past dates */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }
    /* check date availability */

    const checkAvailability = await Schedules.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Schedules date is not available' });
    }

    const schedules = await Schedules.create({
      patient_id: req.userId,
      provider_id,
      date,
    });

    return res.json(schedules);
  }

  async delete(req, res) {
    const schedules = await Schedules.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'patient',
          attributes: ['name'],
        },
      ],
    });

    if (schedules.patient_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this Schedules",
      });
    }

    const dateWithSub = subHours(Schedules.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel Schedules 2 hours in advance',
      });
    }

    schedules.canceled_at = new Date();

    await schedules.save();

    return res.json(schedules);
  }
}

export default new ScheduleController();
