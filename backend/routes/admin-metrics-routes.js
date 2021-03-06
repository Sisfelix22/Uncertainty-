import adminMetrics  from "../controllers/admin-metrics-controller"
var express = require('express')
var router = express.Router()

router.get("/allusers/:templateId/:limit/:offset", adminMetrics.getUserData);

router.get("/allusers/userpost/:templateId/:limit/:offset", adminMetrics.getUsersPostsData);

router.get("/allusers/userpost/actions/:templateId/:limit/:offset", adminMetrics.getUsersPostsActionsData);

router.get("/allusers/socialmedia/:templateId", adminMetrics.getUserDataSocialMediaData);

router.get("/allusers/question/:templateId", adminMetrics.getUserDataQuestionData);

router.get("/templates/allusers/counts", adminMetrics.getTemplatesWithUserCounts);

router.get("/allusers/allMedia/:templateId", adminMetrics.downloadAllMedia);

export default router;
