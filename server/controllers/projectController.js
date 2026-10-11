const mongoose = require('mongoose');

const projectDatabase = () => mongoose.connection.useDb(process.env.PROJECT_DB_NAME || 'Projects');
const descriptionCollection = () => projectDatabase().db.collection(
  process.env.PROJECT_DESCRIPTION_COLLECTION || 'Project details',
);

const normalizeProject = (project) => ({
  ...project,
  _id: String(project._id),
  projectData: project.projectData ? String(project.projectData) : null,
});

const projectCollectionForType = (projectType = '') => {
  const type = String(projectType).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const collectionByType = {
    rocket: process.env.ROCKET_COLLECTION || 'Rockets',
    rocket_motor: process.env.ROCKET_MOTOR_COLLECTION || 'Rocket Motor',
    satellite: process.env.SATELLITE_COLLECTION || 'Satellites',
  };
  return collectionByType[type] || null;
};

const getProjectTechnicalData = async (project) => {
  const collectionName = projectCollectionForType(project.projectType);
  if (!project.projectData || !collectionName) return null;
  return projectDatabase().db.collection(collectionName).findOne({ _id: project.projectData });
};

const hasPublicContent = (project, technicalData) => {
  const name = String(project.projectName || '').trim().toLowerCase();
  const description = String(project.projectDescription || '').trim().toLowerCase();
  const placeholderNames = new Set(['', 'project name', 'name', 'untitled project']);
  const placeholderDescriptions = new Set(['', 'description', 'project description']);
  return !placeholderNames.has(name) && !placeholderDescriptions.has(description) && Boolean(technicalData);
};

const getAllProjects = async (req, res) => {
  try {
    const descriptions = await descriptionCollection().find({}).toArray();
    const projects = await Promise.all(descriptions.map(async (project) => ({
      project,
      technicalData: await getProjectTechnicalData(project),
    })));
    res.json(projects
      .filter(({ project, technicalData }) => hasPublicContent(project, technicalData))
      .map(({ project }) => normalizeProject(project)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const description = await descriptionCollection().findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });
    if (!description) return res.status(404).json({ message: 'Project not found' });

    const projectData = await getProjectTechnicalData(description);
    if (!hasPublicContent(description, projectData)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ ...normalizeProject(description), projectData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllProjects, getProjectById };
