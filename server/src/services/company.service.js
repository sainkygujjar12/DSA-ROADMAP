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

  const counts = await Question.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$companies" },
    { $group: { _id: "$companies", count: { $sum: 1 } } },
  ]);
  const countByCompany = new Map(counts.map(row => [String(row._id), row.count]));
  return companies.map(company => ({
    ...company.toObject(),
    totalQuestions: countByCompany.get(String(company._id)) || 0,
  }));
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
    isActive: true,
  })
    .populate("topic", "name slug icon")
    .populate("companies", "name slug logo color")
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
      returnDocument: 'after',
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
