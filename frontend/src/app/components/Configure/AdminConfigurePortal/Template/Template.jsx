import { Button,
  TextField,
  FormControl,
  Switch,
  FormControlLabel,
  FormGroup,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  FormLabel,
  Container
} from '@material-ui/core';
import { useEffect, useState } from 'react';
// import { TEMPLATE_TYPES } from '../../../../constants';
import { create, updateTemplate } from '../../../../services/template-service';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { useSelector, useDispatch } from "react-redux";
import { Redirect } from 'react-router-dom';
import useStyles from '../../../style';
import { setTemplateId, getPrevTemplate, deletePrevTemplate } from "../../../../actions/template";
import { showErrorSnackbar, showInfoSnackbar, showSuccessSnackbar } from '../../../../actions/snackbar';
import { TEMPLATE } from '../../../../constants';
import SaveIcon from '@material-ui/icons/Save';

const Template = () => {
  const [templateName, setTemplateName] = useState("");
  // const [templateType, setTemplateType] = useState("");
  // const [requiredQualtricsId, setRequiredQualtricsId] = useState(false);
  const [permissions, setPermissions] = useState({
    requestAudio: false,
    requestVideo: false,
    requestCookies: false,
  });
  const { isLoggedInAdmin } = useSelector(state => state.auth);
  const { prevTemplates } = useSelector(state => state.template);
  const [templateCodes, setTemplateCodes] = useState({});
  const classes = useStyles();
  const dispatch = useDispatch();

  const retrivePrevTemplates = async () => {
    await dispatch(getPrevTemplate());
  }
  // on first render check if user logged in, verify server
  useEffect(() => {
    // on load fetch pevious templates
    retrivePrevTemplates();
  }, []);

  // handle this better
  const resetValues = () => {
    setTemplateName("");
    // setTemplateType("");
    // setRequiredQualtricsId(false);
    setPermissions({
      requestAudio: false,
      requestVideo: false,
      requestCookies: false,
    });
    setTemplateCodes({});
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const template = {
      name: templateName,
      requestAudio: permissions.requestAudio,
      requestVideo: permissions.requestVideo,
      requestCookies: permissions.requestCookies,
      // qualtricsId: requiredQualtricsId,
    };
    try {
      const { data } = await create(template);
      if (data._id) {
        // dispatch the event to save template Id in store
        await handleTemplateId(data._id, data.name, TEMPLATE.TEMPLATE_SUCCESS);
        resetValues();
      }
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      dispatch(showErrorSnackbar(resMessage));
    }
  };

  const handleTemplateId = async (_id, name, message) => {
    await dispatch(setTemplateId({ _id, name }));
    resetValues();
    // fetch old templates
    await retrivePrevTemplates();
    dispatch(showSuccessSnackbar(message))
  };

  // const handleQualtricsId = (e) => {
  //   setRequiredQualtricsId(e.target.checked);
  // };

  const handlePermissions = (e) => {
    setPermissions({ ...permissions, [e.target.name]: e.target.checked });
  };

  if (!isLoggedInAdmin) {
    return <Redirect to="/admin" />;
  }

  const removeTemplate = async (index) => {
    await dispatch(deletePrevTemplate(index));
    await retrivePrevTemplates();
  };

  const handleChange = async (templateId, e) => {
    e.preventDefault();
    const newObj = {
      ...templateCodes,
      [templateId]: e.target.value
    };
    await setTemplateCodes(newObj);
  };

  const handleTemplateCode = async (templateId) => {
    const changedTemplateCode = templateCodes[templateId];
    if (Number(changedTemplateCode) && changedTemplateCode >= 100000 && changedTemplateCode <= 999999) {
      const tempObj = {
        _id: templateId,
        templateCode: templateCodes[templateId]
      };
      await updateTemplate({ tempObj });
      setTemplateCodes({});
      dispatch(showInfoSnackbar("Access code successfully updated"));
      await retrivePrevTemplates();
    } else {
      dispatch(showInfoSnackbar("Please enter valid Access Code i.e. [100000, 999999]"));
    }
  };

  return (
    <>
    <Container component="main" maxWidth="lg" className={classes.card}>
    <form onSubmit={handleSubmit} className={classes.form}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="templateName"
        value={templateName}
        label={TEMPLATE.PROVIDE_A_CONDITION_NAME}
        onChange={({ target }) => setTemplateName(target.value)}
        autoFocus
      />
      <p>{TEMPLATE.ASK_FOR_PERMISSION}</p>
      {/* <FormGroup>
        <FormControlLabel
          control={<Switch
            checked={requiredQualtricsId}
            onChange={handleQualtricsId}
            color="primary"
            name="requiredQualtricsId"
            inputProps={{ 'aria-label': 'Request qualtrics code checkbox' }}
          />}
          label={TEMPLATE.REQUIRE_PARTICIPANT_ID}
        />
      </FormGroup> */}
      <FormGroup>
        <FormControlLabel
          control={<Switch
            checked={permissions.requestAudio}
            onChange={handlePermissions}
            color="primary"
            name="requestAudio"
            inputProps={{ 'aria-label': 'Request audio permissions' }}
          />}
          label="Request audio access"
        />
        <FormControlLabel
          control={<Switch
            checked={permissions.requestVideo}
            onChange={handlePermissions}
            color="primary"
            name="requestVideo"
            inputProps={{ 'aria-label': 'Request Video permission' }}
          />}
          label="Request video access"
        />
        <FormControlLabel
          control={<Switch
            checked={permissions.requestCookies}
            onChange={handlePermissions}
            color="primary"
            name="requestCookies"
            inputProps={{ 'aria-label': 'Request Cookies permission' }}
          />}
          label="Request cookies"
        />
      </FormGroup>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        className={classes.submit}
      >
        Save
      </Button>
    </form>
    </Container>

    <Container component="main" maxWidth="lg" className={classes.card}>
    <Box component="span" className={classes.note} display="block">
      {TEMPLATE.TEMPLATE_DELETE_NOTE}
    </Box>
      <Table aria-label="Template(s)">
        <TableHead>
          <TableRow>
            <TableCell className={classes.body, classes.head} align="center">{TEMPLATE.CONDITION_NAME}</TableCell>
            <TableCell className={classes.body, classes.head} align="center">{TEMPLATE.LANGUAGE}</TableCell>
            <TableCell className={classes.body, classes.head} align="center">{TEMPLATE.CHANGE_ACCESS_CODE}</TableCell>
            <TableCell className={classes.body, classes.head} align="center">{TEMPLATE.ACCESS_CODE}</TableCell>
            <TableCell className={classes.body, classes.head} align="center">{TEMPLATE.SET_AS_ACTIVE}</TableCell>
            <TableCell className={classes.body, classes.head} align="center">{TEMPLATE.DELETE}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prevTemplates && prevTemplates.length > 0 ? prevTemplates.map((row) => (
            <TableRow key={row._id}>
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.language}</TableCell>
              <TableCell align="center">
                <TextField
                  id="standard-number"
                  value={templateCodes[row._id] || ""}
                  onChange={e => handleChange(row._id, e)}
                  inputProps={{ min: 100000, max: 999999 }}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <IconButton aria-label="Save template code" onClick={() => handleTemplateCode(row._id)}>
                  <SaveIcon color="primary" />
                </IconButton>
              </TableCell>
              <TableCell align="center">
                <p style={{ textAlign: 'center' }}>{row.templateCode}</p>
              </TableCell>
              <TableCell align="center">
                <IconButton aria-label="set template" onClick={() => handleTemplateId(row._id, row.name, TEMPLATE.TEMPLATE_CURRENT_SELECT)}>
                  <AddIcon color="primary" />
                </IconButton>
              </TableCell>
              <TableCell align="center">
                <IconButton aria-label="delete template" onClick={() => removeTemplate(row._id)}>
                  <DeleteIcon color="primary" />
                </IconButton>
              </TableCell>
            </TableRow>
          )) : null}
        </TableBody>
      </Table>
    </Container>
    </>
  )
}

export default Template;