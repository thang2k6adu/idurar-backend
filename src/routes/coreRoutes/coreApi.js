import express from 'express'
import { errorHandlers } from '~/handlers/errorHandlers'
import adminController from '~/controllers/coreControllers/adminControllers'
import settingController from '~/controllers/coreControllers/settingController'
import { localSingleStorage } from '~/middlewares/uploadMiddleware/localSingleStorage'

const router = express.Router()

// //_______________________________ Admin management_______________________________
router.route('/admin/read/:id').get(errorHandlers.catchErrors(adminController.read))
// Update any user password
router.route('/admin/password-update/:id').patch(errorHandlers.catchErrors(adminController.updatePassword))

//_______________________________ Admin Profile _______________________________
router.route('/admin/profile/password').patch(errorHandlers.catchErrors(adminController.updateProfilePassword))
router
  .route('/admin/profile/update')
  .patch(
    localSingleStorage({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    errorHandlers.catchErrors(adminController.updateProfile)
  )

// API for global settings
router.route('/setting/create').post(errorHandlers.catchErrors(settingController.create))
router.route('/setting/read/:id').get(errorHandlers.catchErrors(settingController.read))
router.route('/setting/update/:id').patch(errorHandlers.catchErrors(settingController.update))
//router.route('/setting/delete/:id).delete(catchErrors(settingController.delete));
router.route('/setting/search').get(errorHandlers.catchErrors(settingController.search))
router.route('/setting/list').get(errorHandlers.catchErrors(settingController.list))
router.route('/setting/listAll').get(errorHandlers.catchErrors(settingController.listAll))
router.route('/setting/filter').get(errorHandlers.catchErrors(settingController.filter))

// ? in this route is optional
router
  .route('/setting/readBySettingKey/:settingKey?')
  .get(errorHandlers.catchErrors(settingController.readBySettingKey))
router.route('/setting/listBySettingKey').get(errorHandlers.catchErrors(settingController.listBySettingKey))
router
  .route('/setting/updateBySettingKey/:settingKey?')
  .patch(errorHandlers.catchErrors(settingController.updateBySettingKey))
router
  .route('/setting/upload/:settingKey?')
  .patch(
    localSingleStorage({ entity: 'setting', fieldName: 'photo', fileType: 'image' }),
    errorHandlers.catchErrors(settingController.updateBySettingKey)
  )
// router
//   .route('/setting/upload/:settingKey?')
//   .patch(
//     catchErrors(singleStorageUpload({ entity: 'setting', fieldName: 'settingValue', fileType: 'image' })),
//     catchErrors(settingController.updateBySettingKey)
//   )
router.route('/setting/updateManySetting').patch(errorHandlers.catchErrors(settingController.updateManySetting))

export default router
