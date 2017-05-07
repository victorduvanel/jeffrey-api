import amqplib from 'amqplib';

let _prom = null;

export default () => {
  if (_prom === null) {
    _prom = amqplib.connect('amqp://localhost');
  }
  return _prom;
};
