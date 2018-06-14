import Mission from '../models/mission';

export const post = [
  async (req, res) => {
    await Mission.startMissions();
    res.send('ok');
  }
];
