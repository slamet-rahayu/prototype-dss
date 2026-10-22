import { authenticate, authorizeRole } from '@/server/utils/routeMiddleware.js';
import { dbRepository } from '@/server/db/index.js';
import { successResponse, errorResponse } from '@/server/utils/apiResponse.js';
import { 
  initScheduler, 
  updateSchedulerConfig 
} from '@/server/services/schedulerService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const status = initScheduler();
    const configs = await dbRepository.getSchedulerConfigs();

    const responseData = {
      ...status.config,
      isScheduled: status.isScheduled,
      isRunning: status.isRunning,
      taskStatus: status.taskStatus,
      nextRun: status.nextRun,
      careerConfigs: configs
    };

    return successResponse(responseData, 'Konfigurasi scheduler berhasil dimuat');
  } catch (error) {
    return errorResponse(error.message || 'Gagal memuat konfigurasi scheduler', 500);
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();
    const { careerName, careerId, cronExpression, executionTime, timezone, isActive } = body || {};

    if (!careerName || !careerName.trim()) {
      return errorResponse('Nama karir wajib diisi', 400);
    }

    const created = await dbRepository.createSchedulerConfig({
      careerName: careerName.trim(),
      careerId: careerId || null,
      cronExpression: cronExpression || '0 2 * * *',
      executionTime: executionTime || '02.00',
      timezone: timezone || 'Asia/Jakarta',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    const configs = await dbRepository.getSchedulerConfigs();

    return successResponse({
      careerConfig: created,
      careerConfigs: configs
    }, 'Konfigurasi karir berhasil ditambahkan ke antrian scheduler', 201);
  } catch (error) {
    return errorResponse(error.message || 'Gagal menambahkan konfigurasi karir', 500);
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const body = await request.json();

    // If updating a specific career config item in table SchedulerConfig
    if (body?.careerConfigId) {
      const updated = await dbRepository.updateSchedulerConfig(body.careerConfigId, body.careerConfigData || {});
      const configs = await dbRepository.getSchedulerConfigs();
      return successResponse({
        careerConfig: updated,
        careerConfigs: configs
      }, 'Konfigurasi karir berhasil diperbarui');
    }

    // Direct update of a career config if id and career fields are present
    if (body?.id && (body?.careerName || body?.cronExpression || body?.executionTime || body?.isActive !== undefined)) {
      const { id, ...dataToUpdate } = body;
      const updated = await dbRepository.updateSchedulerConfig(id, dataToUpdate);
      const configs = await dbRepository.getSchedulerConfigs();
      return successResponse({
        careerConfig: updated,
        careerConfigs: configs
      }, 'Konfigurasi karir berhasil diperbarui');
    }

    // Otherwise, updating global master scheduler configuration
    const updatedStatus = updateSchedulerConfig(body);
    const configs = await dbRepository.getSchedulerConfigs();

    const responseData = {
      ...updatedStatus.config,
      isScheduled: updatedStatus.isScheduled,
      isRunning: updatedStatus.isRunning,
      taskStatus: updatedStatus.taskStatus,
      nextRun: updatedStatus.nextRun,
      careerConfigs: configs
    };

    return successResponse(responseData, 'Konfigurasi scheduler berhasil diperbarui');
  } catch (error) {
    const statusCode = error.message?.includes('tidak valid') ? 400 : 500;
    return errorResponse(error.message || 'Gagal memperbarui scheduler', statusCode);
  }
}

export async function DELETE(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    const roleErr = authorizeRole(user, ['ADMIN']);
    if (roleErr) return roleErr;

    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return errorResponse('Parameter id konfigurasi karir wajib diberikan', 400);
    }

    const deleted = await dbRepository.softDeleteSchedulerConfig(id);
    if (!deleted) {
      return errorResponse('Konfigurasi karir tidak ditemukan', 404);
    }

    const configs = await dbRepository.getSchedulerConfigs();

    return successResponse({
      deletedId: id,
      careerConfigs: configs
    }, 'Konfigurasi karir berhasil dihapus dari antrian (soft delete)');
  } catch (error) {
    return errorResponse(error.message || 'Gagal menghapus konfigurasi karir', 500);
  }
}
