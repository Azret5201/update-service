import { User } from "../models/User";
import { Permission } from "../models/Permission";
import { RolePermissions } from "../models/RolePermissions";

export async function checkPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
        const user: any = await User.findOne({
            attributes: ['id', 'id_role'],
            where: { id: userId },
        });

        if (!user) {
            console.log('Пользователь не найден');
            return false;
        }

        const permission: any = await Permission.findOne({
            where: { name: permissionName }
        });

        if (!permission) {
            console.log('Разрешение не найдено');
            return false;
        }

        const rolePermissions: any = await RolePermissions.findOne({
            where: { role_id: user.id_role, permission_id: permission.id },
        });

        return !!rolePermissions;
    } catch (error) {
        console.error('Произошла ошибка при попытке проверки доступа:', error);
        return false;
    }
}
