import bodyParser from 'body-parser';

export const post = [
  bodyParser.json(),
  async (req, res) => {

    res.send({
      success: true
    });
  }
];
