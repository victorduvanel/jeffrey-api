import puppeteer from 'puppeteer';
import Mission from '../models/mission';
import { render } from '../services/handlebars';
import config from '../config';

export const get = [
  async (req, res) => {
        const { missionId } = req.params;
        const mission = await Mission.find(missionId);

        if (!mission || mission.get('status') !== 'terminated') {
            throw new Error('not found');
        }

        const html = await render('html/invoice', {
            mission: {
                id: mission.get('id'),
                price: mission.get('price'),
                currency: mission.get('currency'),
                totalCost: mission.totalCost()
            }
        });

        let options;
        if (config.PRODUCTION) {
          options = {
            executablePath: '/usr/bin/google-chrome-stable',
            args: [ '--no-sandbox' ]
          };
        }

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.setContent(html);
        await page.emulateMedia('screen');
        const buffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.set('Content-Type', 'application/pdf');
        res.send(buffer);
    }
];
