const calculateDistance = (random, rotationValue, interval) => {
  return - Math.abs((random - rotationValue) / interval);
};

export default calculateDistance;
