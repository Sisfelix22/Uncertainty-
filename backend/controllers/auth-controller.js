import db from "../clients/database-client";
import { secretConfigurations } from '../utils';

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = db.Admin;
const secret = secretConfigurations();

export const signInAdmin = (req, res) => {
  Admin.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(admin => {
      if (!admin) {
        return res.status(404).send({ message: "Admin user Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        admin.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ _id: admin._id }, secret, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        _id: admin._id,
        username: admin.username,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
