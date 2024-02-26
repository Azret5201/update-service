import {Request, Response} from 'express';
import {updateGSFR} from "../../services/GSFR/updateGSFR";

export class GSFRUpdateController {

    public async update(req: Request, res: Response) {
        try {
            // Используйте await перед вызовом getDataForReport
            
            const reportData: any = await updateGSFR(req.body.urls)
        } catch (error) {
            console.error('Ошибка при получении данных для отчета:', error);
            res.status(500).json({success: false, message: 'Ошибка при получении данных для отчета, ' + error});
        }
        
        console.log('script complete');
        res.status(200).json('Success');
    }
}
