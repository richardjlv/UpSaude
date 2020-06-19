import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import authConfig from '../../config/auth';
import User from '../models/User';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: File,
          as: 'certified',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: File,
          as: 'rg',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Unregistered user' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const {
      id,
      name,
      phone,
      address,
      cpf,
      provider,
      admin,
      work_location,
      avatar,
      rg,
      certified,
    } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        phone,
        address,
        cpf,
        provider,
        admin,
        work_location,
        avatar,
        rg,
        certified,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
