import { Request, Response } from 'express';
import { updateGSFR } from "../../services/GSFR/updateGSFR";

export class GSFRUpdateController {

    public async update(req: Request, res: Response) {
        const urls = req.body.urls;

        // Проверка наличия всех полей
        const requiredFields = ['UN', 'SSPKR', 'PFT', 'PLPD_FIZ', 'PLPD_UR'];
        const missingFields = requiredFields.filter(field => !urls[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Не заполнены обязательные поля: ${missingFields.join(', ')}`
            });
        }

        // Проверка ссылок
        const isUrl = (url: string) => {
            try {
                new URL(url);
                return true;
            } catch (error) {
                return false;
            }
        };

        const invalidUrls = requiredFields.filter(field => !isUrl(urls[field]));

        if (invalidUrls.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Некорректные ссылки в полях: ${invalidUrls.join(', ')}`
            });
        }

        try {
            // Выполните обновление только если все поля заполнены и содержат корректные ссылки
            await updateGSFR(req.body.urls);

            console.log('Список ГСФР успешно обновлён');
            res.status(200).json({ success: true, message: 'Список ГСФР успешно обновлён' });
        } catch (error) {
            console.error('Ошибка при обновлении списка ГСФР:', error);
            res.status(500).json({ success: false, message: 'Ошибка при обновлении списка ГСФР: ' + error });
        }
    }
}
