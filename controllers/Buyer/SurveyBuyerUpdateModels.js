// const { Survey, Condition, Quotas } = require("../../models/association");
// const sequelize = require("../../config");

// exports.updateSurvey = async (req, res) => {
//   try {
//     const { id } = req.params; 

//     const survey = await Survey.findByPk(id);

//     if (!survey) {
//       return res.status(404).json({
//         status: "error",
//         message: "Survey not found",
//       });
//     }

//     const {
//       SurveyStatusCode,
//       ClientCPI,
//       ClientSurveyLiveURL,
//       TestRedirectURL,
//       qualification,
//       Quotas: quotas,
//       status
//     } = req.body;

//     // Update the survey only with provided valid data
//     const updateData = {};

//     if (SurveyStatusCode) updateData.SurveyStatusCode = SurveyStatusCode;
//     if (ClientCPI !== undefined) updateData.ClientCPI = ClientCPI;
//     if (ClientSurveyLiveURL)
//       updateData.ClientSurveyLiveURL = ClientSurveyLiveURL;
//     if (TestRedirectURL) updateData.TestRedirectURL = TestRedirectURL;
//     if (status !== undefined) updateData.status = status;

//     // Update the survey data
//     await survey.update(updateData);

//     // Update qualifications if provided
//     if (qualification && Array.isArray(qualification)) {
//       for (const qual of qualification) {
//         if (qual.id) {
//           // Find and update existing qualification by ID
//           await Condition.update(
//             { PreCodes: JSON.stringify(qual.PreCodes) },
//             { where: { ConditionID: qual.id, SurveyQuotaID: qual.SurveyQuotaID } }
//           );
//         }
//       }
//     }

//     // Update quotas if provided
//     if (quotas && Array.isArray(quotas)) {
//       for (const quota of quotas) {
//         if (quota.SurveyQuotaID) {
//           // Find and update existing quota by ID
//           await Quotas.update(
//             {
//               Name: quota.Name,
//               SurveyQuotaType: quota.SurveyQuotaType,
//               FieldTarget: quota.FieldTarget,
//               Quota: quota.Quota,
//               Prescreens: quota.Prescreens,
//               Completes: quota.Completes,
//               IsActive: quota.IsActive,
//             },
//             { where: { SurveyQuotaID: quota.SurveyQuotaID } }
//           );
//         }
//       }
//     }

//     // Respond with the updated survey data
//     res.status(201).json({
//       status: "success",
//       data: {
//         id: survey.id,
//         SurveyStatusCode: survey.SurveyStatusCode,
//         ClientCPI: survey.ClientCPI,
//         ClientSurveyLiveURL: survey.ClientSurveyLiveURL,
//         TestRedirectURL: survey.TestRedirectURL,
//         IsActive: survey.IsActive,
//         Quotas: quotas,
//         qualification: qualification,
//         status: survey.status
//       },
//     });
//   } catch (err) {
//     console.error("Error updating survey:", err.message || err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };
