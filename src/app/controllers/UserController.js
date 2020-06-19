import * as Yup from 'yup';

import File from '../models/File';
import Solicitation from '../models/Solicitation';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      provider: Yup.boolean().required(),
      phone: Yup.string().required(),
      cpf: Yup.string().required(),
      address: Yup.string().required(),
      work_location: Yup.string().when('provider', (provider, field) =>
        provider ? field.required() : field
      ),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });
    const providerExists = await Solicitation.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    if (providerExists) {
      return res.status(400).json({ error: 'Provider already exists.' });
    }

    let avatar_id = null;
    let certified_id = null;
    let rg_id = null;

    if (req.files.avatar) {
      const { originalname, filename: path } = req.files.avatar[0];
      const { id } = await File.create({ name: originalname, path });
      avatar_id = id;
    }

    if (req.files.certified) {
      const { originalname, filename: path } = req.files.certified[0];
      const { id } = await File.create({ name: originalname, path });
      certified_id = id;
    }

    if (req.files.rg) {
      const { originalname, filename: path } = req.files.rg[0];
      const { id } = await File.create({ name: originalname, path });
      rg_id = id;
    }

    const {
      name,
      phone,
      cpf,
      address,
      work_location,
      email,
      password,
      provider,
    } = req.body;
    if (provider) {
      await Solicitation.create({
        name,
        phone,
        cpf,
        address,
        work_location,
        email,
        password,
        avatar_id,
        certified_id,
        rg_id,
        admin: false,
      });
      return res.json();
    }

    await User.create({
      provider,
      name,
      phone,
      cpf,
      address,
      work_location,
      email,
      password,
      avatar_id,
      certified_id,
      rg_id,
      admin: false,
    });

    return res.json();
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      provider: Yup.boolean(),
      phone: Yup.string(),
      cpf: Yup.string(),
      work_location: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: File,
          as: 'certified',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: File,
          as: 'rg',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    const { email, oldPassword } = req.body;

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    let avatar_id = null;
    let certified_id = null;
    let rg_id = null;

    if (req.files.avatar) {
      const { originalname, filename: path } = req.files.avatar[0];
      const { id } = await user.avatar.update({ name: originalname, path });
      avatar_id = id;
    }

    if (req.files.certified) {
      const { originalname, filename: path } = req.files.certified[0];
      const { id } = await user.certified.update({ name: originalname, path });
      certified_id = id;
    }

    if (req.files.rg) {
      const { originalname, filename: path } = req.files.rg[0];
      const { id } = await user.rg.update({ name: originalname, path });
      rg_id = id;
    }

    const {
      id,
      name,
      phone,
      cpf,
      address,
      work_location,
      password,
      avatar,
      rg,
      certified,
    } = await user.update({
      ...req.body,
      avatar_id,
      certified_id,
      rg_id,
    });

    return res.json({
      id,
      name,
      phone,
      cpf,
      address,
      work_location,
      email,
      password,
      avatar,
      rg,
      certified,
    });
  }
}

export default new UserController();
