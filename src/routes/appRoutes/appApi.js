import express from 'express'
import { errorHandlers } from '~/handlers/errorHandlers'
import appControllers from '~/controllers/appControllers'
import { routesList } from '~/models/utils'

const router = express.Router()

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(errorHandlers.catchErrors(controller.create))
  router.route(`/${entity}/read/:id`).get(errorHandlers.catchErrors(controller.read))
  router.route(`/${entity}/update/:id`).put(errorHandlers.catchErrors(controller.update))
  router.route(`/${entity}/remove/:id`).delete(errorHandlers.catchErrors(controller.remove))
  router
    .route(`/${entity}/paginatedList`)
    .get(errorHandlers.catchErrors(controller.paginatedList))
  router.route(`/${entity}/search`).get(errorHandlers.catchErrors(controller.search))
  router.route(`/${entity}/filter`).get(errorHandlers.catchErrors(controller.filter))
  router.route(`/${entity}/list`).get(errorHandlers.catchErrors(controller.list))
  router.route(`/${entity}/listAll`).get(errorHandlers.catchErrors(controller.listAll))
  router.route(`/${entity}/summary`).get(errorHandlers.catchErrors(controller.summary))
  router.route(`/${entity}/sendMail`).post(errorHandlers.catchErrors(controller.sendMail))

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/Mail`).post(errorHandlers.catchErrors(controller.mail))
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).post(errorHandlers.catchErrors(controller.convert))
  }
}

routesList.forEach(({ entity, controllerName }) => {
  routerApp(entity, appControllers[controllerName])
})

export default router
