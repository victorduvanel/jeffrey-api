import uuid     from 'uuid';
import Promise  from 'bluebird';
import rabbitmq from '../services/rabbitmq';

let channel = null;

export const get = [
  (req, res) => {
    return new Promise(async (resolve) => {
      const requestId = uuid.v4();

      if (channel === null) {
        const conn = await rabbitmq();
        channel = await conn.createChannel();
      }

      const q = await channel.assertQueue('', { exclusive: true });

      await channel.consume(q.queue, (msg) => {
        if (msg.properties.correlationId === requestId) {
          const response = JSON.parse(msg.content.toString());

          res.send(response);
          resolve();
        }
      }, { noAck: true });

      await channel.sendToQueue(
        'incoming_http_request',
        new Buffer('something to do'),
        {
          correlationId: requestId,
          replyTo: q.queue
        }
      );
    });
  }
];
