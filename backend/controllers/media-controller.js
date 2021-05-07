import db from "../clients/database-client";
import page from './create-page';
const Media = db.Media;
const UserPost = db.UserPost;

const create = async (req, res, next) => {
  // create the page first
  let transaction;
  try {
    // fetch the adminId added from middleware
    if (!req.adminId) {
      res.status(400).send({
        message: "Invalid Token, please log in again!"
      });
      return;
    }
    const { templateId, type, name, mediaPosts, pageDataOrder } = req.body;
    if (!templateId) {
      res.status(400).send({
        message: "Template Id is required!"
      });
      return;
    }
    if (!name) { // media
      res.status(400).send({
        message: "Page Name is required!"
      });
      return;
    }
    if (!type) { // FACEBOOK, TWITTER, etc
      res.status(400).send({
        message: "Page type is required!"
      });
      return;
    }
    if (!mediaPosts && Array.isArray(mediaPosts) && mediaPosts.length > 0) {
      res.status(400).send({
        message: "Media post object is required!"
      });
      return;
    }
    transaction = await db.sequelize.transaction();
    // create the page with the name within each pageQuestionArray and template Id
    const pageId = await page.pageCreate({
      name: name,
      templateId,
      type,
      pageDataOrder: pageDataOrder || null
    }, transaction);

    // modify the media array
    const mediaKeys = ['adminPostId', 'link', 'linkTitle', 'linkPreview', 'postMessage', 'sourceTweet', 'type', 'isFake'];
    const mediaArr = [];
    for (let i = 1; i < mediaPosts.length; i++) {
      if (mediaPosts[i].length > 0) {
        let obj = {};
        for (let j = 0; j < mediaPosts[i].length; j++) {
          obj[mediaKeys[j]] = mediaPosts[i][j];
        }
        obj.pageId = pageId;
        mediaArr.push(obj);
      }
    }

    // create the Post records
    const data = await UserPost.bulkCreate(mediaArr, { transaction });
    const postMetaData = {};
    data.forEach(post => {
      postMetaData[post.adminPostId] = post._id;
    });
    // if we reach here, there were no errors therefore commit the transaction
    await transaction.commit();

    // return the pageId with the request
    res.send({
      postMetaData: postMetaData || null
    });
  } catch (error) {
    console.log(error.message);
    // if we reach here, there were some errors thrown, therefore roolback the transaction
    if (transaction) await transaction.rollback();
    res.status(500).send({
      message: "Some error occurred while creating the Admin Post record. Make sure post ID(s) are not same!"
    });
  }
};

const uploadMultipleFiles = async (req, res, next) => {
  // create the page first
  let transaction;

  try {
    const postMetaData = JSON.parse(req.body.postMetaData);
    const { files } = req;
    if (!files) {
      res.status(400).send({
        message: "You must provide a file!"
      });
      return;
    }
    if (!postMetaData) {
      res.status(400).send({
        message: "Post Meta data is required!"
      });
      return;
    }

    transaction = await db.sequelize.transaction();
    const mediaArr = [];
    for (let i = 0; i < files.length; i++) {
      // fetch the id from file name
      const postId = files[i].originalname.split(".")[0];
      // should only create entry if post id exist
      if (postMetaData[postId]) {
        mediaArr.push({
          mimeType: files[i].mimetype,
          media: files[i].buffer,
          userPostId: postMetaData[postId],
        });
      }
    }
    await Media.bulkCreate(mediaArr, { transaction });
    // if we reach here, there were no errors therefore commit the transaction
    await transaction.commit();
    // fetch json
    res.send("Done!");
  } catch (error) {
    console.log(error.message);
    // if we reach here, there were some errors thrown, therefore roolback the transaction
    if (transaction) await transaction.rollback();
    res.status(500).send({
      message: "Some error occurred while storing multi post media."
    });
  }
};

export default {
  create,
  uploadMultipleFiles
}