import rabbitmq from '../services/rabbitmq';


const getMessageQueue = async (name) => {
    const conn = await rabbitmq();
    const ch = await conn.createChannel();
    await ch.assertQueue(name, {durable: false});
    return ch;
};

let messageQueue = null;


export const get = [
    async (req, res) => {

        if (messageQueue === null) {
            messageQueue = await getMessageQueue('bonjour');
        }

        await messageQueue.sendToQueue('bonjour', new Buffer('something to do'));

        res.send({
            hello: 'world'
        });
    }
];
