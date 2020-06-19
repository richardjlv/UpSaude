import * as Yup from 'yup';

import File from '../models/File';
import Solicitation from '../models/Solicitation';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const solicitations = await Solicitation.findAll({
      order: ['created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: File,
          as: 'certified',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: File,
          as: 'rg',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(solicitations);
  }

  async store(req, res) {
    const { id } = req.body;

    const solicitation = await Solicitation.findByPk(id);
    const {
      name,
      phone,
      cpf,
      address,
      password_hash,
      work_location,
      email,
      password,
      avatar_id,
      certified_id,
      rg_id,
    } = solicitation;

    try {
      await User.create({
        provider: true,
        name,
        phone,
        cpf,
        address,
        password_hash,
        work_location,
        email,
        password,
        avatar_id,
        certified_id,
        rg_id,
        admin: false,
      });
      (await solicitation).destroy();
    } catch (err) {
      return res.status(400).json({ error: true });
    }

    return res.json();
  }

  async delete(req, res) {
    const { id } = req.body;

    const solicitation = await Solicitation.findByPk(id);

    await solicitation.destroy();

    return res.json();
  }
}

export default new UserController();
