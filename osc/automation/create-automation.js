import addEntitiesAutomation from "./add-entities.js";
import addFileAutomation from "./add-file.js";
import addExperimentAutomation from "./add-experiment.js";
import addVarProjProdBundleAutomation from "./add-var-proj-prod-bundle.js";
import editFileAutomationAutomation from "./edit-file.js";

export default function createAutomation() {
  const entitiesAutomation = addEntitiesAutomation();
  const fileAutomation = addFileAutomation();
  const experimentAutomation = addExperimentAutomation();
  const varProjProdBundleAutomation = addVarProjProdBundleAutomation();
  const editFileAutomation = editFileAutomationAutomation();

  return [
    ...entitiesAutomation,
    varProjProdBundleAutomation,
    editFileAutomation,
    fileAutomation,
    experimentAutomation,
  ];
}
