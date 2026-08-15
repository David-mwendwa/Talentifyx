import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { BadRequestError, UnauthenticatedError } from '../errors/customErrors.js';
import { createJWT } from '../utils/tokenUtils.js';

const ONE_DAY = 1000 * 60 * 60 * 24;

const setAuthCookie = (res, user) => {
  const token = createJWT({ userId: user._id, role: user.role });
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

export const register = async (req, res) => {
  const { email } = req.body;
  if (await User.findOne({ email })) {
    throw new BadRequestError('email already in use');
  }

  const isFirstAccount = (await User.countDocuments()) === 0;
  const user = await User.create({
    ...req.body,
    role: isFirstAccount ? 'admin' : 'user',
    password: await hashPassword(req.body.password),
  });

  setAuthCookie(res, user);
  res.status(StatusCodes.CREATED).json({ user });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const isValidUser =
    user && (await comparePassword(req.body.password, user.password));
  if (!isValidUser) throw new UnauthenticatedError('incorrect email or password');

  setAuthCookie(res, user);
  res.status(StatusCodes.OK).json({ user });
};

export const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(Date.now()) });
  res.status(StatusCodes.OK).json({ message: 'logged out' });
};
