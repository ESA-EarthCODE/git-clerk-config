import addEntitiesAutomation from "./add-entities.js";

export default function createAutomation(config) {
  const entitiesAutomation = addEntitiesAutomation(config);
  const customAutomation = config.customAutomation || [];

  return [...entitiesAutomation, ...customAutomation];
}
