const double = n => {
  const double = n >= 10 ? n : `0${n.toString()}`;
  return double;
};

export default double;
