import randombytes from 'randombytes';

export const generateJoinCode = () => {
  return randombytes(3).toString('hex');
};

