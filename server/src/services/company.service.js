const Company = require("../models/Company");
const Question = require("../models/Question");
const {
  getUserQuestionFlags,
  attachUserFlags,
} = require("./progress.service");

// ======================================
// Get All Companies
// ======================================

exports.getCompanies = async () => {
  const companies = await Company.find().sort({
    name: 1,
  });

  const result = await Promise.all(
    companies.map(async (company) => {
      const totalQuestions =
        await Question.countDocuments({
          companies: company._id,
        });

      return {
        ...company.toObject(),
        totalQuestions,
      };
    })
  );

  return result;
};

// ======================================
// Get Company By Slug
// ======================================

exports.getCompanyBySlug = async (
  slug,
  userId
) => {
  const company = await Company.findOne({
    slug,
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const questions = await Question.find({
    companies: company._id,
  })
    .populate("topic", "name slug icon")
    .populate("companies", "name logo")
    .populate("sheets", "name")
    .sort({
      difficulty: 1,
      title: 1,
    });

  const { solvedSet, bookmarkedSet } =
    await getUserQuestionFlags(userId);

  return {
    company,
    questions: attachUserFlags(
      questions,
      solvedSet,
      bookmarkedSet
    ),
  };
};

// ======================================
// Create Company
// ======================================

exports.createCompany = async (
  data
) => {
  return await Company.create(data);
};

// ======================================
// Update Company
// ======================================

exports.updateCompany = async (
  id,
  data
) => {
  return await Company.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

// ======================================
// Delete Company
// ======================================

exports.deleteCompany = async (
  id
) => {
  return await Company.findByIdAndDelete(
    id
  );
};