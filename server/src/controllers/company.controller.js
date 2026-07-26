const companyService = require("../services/company.service");

// ======================================
// Get All Companies
// ======================================

exports.getAllCompanies = async (req, res) => {
  try {
    const companies =
      await companyService.getCompanies();

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Company
// ======================================

exports.getCompany = async (req, res) => {
  try {
    const company =
      await companyService.getCompanyBySlug(
        req.params.slug,
        req.user?.id
      );

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Company
// ======================================

exports.createCompany = async (req, res) => {
  try {
    const company =
      await companyService.createCompany(
        req.body
      );

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Company
// ======================================

exports.updateCompany = async (req, res) => {
  try {
    const company =
      await companyService.updateCompany(
        req.params.id,
        req.body
      );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Company
// ======================================

exports.deleteCompany = async (req, res) => {
  try {
    const company =
      await companyService.deleteCompany(
        req.params.id
      );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};