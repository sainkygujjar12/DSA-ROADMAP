const Progress = require("../models/Progress");
const Question = require("../models/Question");
const { ensureProgress, mutateProgress } = require("../utils/progressMutation");

// Question/sheet screens only need IDs and notes, not every solved question's
// populated topic, companies and sheets. Keep this private data uncached.
exports.getProgressSummary = async (userId) => {
  return await Progress.findOne({ user: userId })
    .select('solvedQuestions bookmarkedQuestions notes')
    .lean() || { solvedQuestions: [], bookmarkedQuestions: [], notes: [] };
};

// ======================================
// Get Solved / Bookmarked ID Sets
// Lightweight helper (no populate) used by public
// browsing routes (topics, sheets, companies) to
// stamp `solved` / `bookmarked` flags onto question
// lists for the current user, if logged in.
// ======================================

exports.getUserQuestionFlags = async (userId) => {
  if (!userId) {
    return { solvedSet: new Set(), bookmarkedSet: new Set() };
  }

  const progress = await Progress.findOne({ user: userId })
    .select("solvedQuestions bookmarkedQuestions")
    .lean();

  if (!progress) {
    return { solvedSet: new Set(), bookmarkedSet: new Set() };
  }

  return {
    solvedSet: new Set(
      (progress.solvedQuestions || []).map((id) => id.toString())
    ),
    bookmarkedSet: new Set(
      (progress.bookmarkedQuestions || []).map((id) => id.toString())
    ),
  };
};

exports.attachUserFlags = (questions, solvedSet, bookmarkedSet) => {
  return questions.map((q) => {
    const obj = q.toObject ? q.toObject() : q;
    const id = obj._id.toString();

    return {
      ...obj,
      solved: solvedSet.has(id),
      bookmarked: bookmarkedSet.has(id),
    };
  });
};


// ======================================
// Get User Progress
// ======================================

// ======================================
// Get User Progress
// ======================================

exports.getProgress = async (userId) => {
  let progress = await Progress.findOne({
    user: userId,
  })
    .populate({
      path: "solvedQuestions",
      populate: [
        { path: "topic", select: "name slug icon" },
        { path: "companies", select: "name logo" },
        { path: "sheets", select: "name" },
      ],
    })
    .populate({
      path: "bookmarkedQuestions",
      populate: [
        { path: "topic", select: "name slug icon" },
        { path: "companies", select: "name logo" },
        { path: "sheets", select: "name" },
      ],
    })
    .populate("lastVisitedQuestion")
    .populate({
      path: "notes.question",
      select: "title slug",
    });

  if (!progress) {
    await ensureProgress(userId);

    progress = await Progress.findOne({
      user: userId,
    })
      .populate({
        path: "solvedQuestions",
        populate: [
          { path: "topic", select: "name slug icon" },
          { path: "companies", select: "name logo" },
          { path: "sheets", select: "name" },
        ],
      })
      .populate({
        path: "bookmarkedQuestions",
        populate: [
          { path: "topic", select: "name slug icon" },
          { path: "companies", select: "name logo" },
          { path: "sheets", select: "name" },
        ],
      })
      .populate("lastVisitedQuestion")
      .populate({
        path: "notes.question",
        select: "title slug",
      });
  }

  return progress;
};

// ======================================
// Toggle Solved Question
// ======================================

exports.toggleSolvedQuestion = async (
  userId,
  questionId
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  await mutateProgress(userId, progress => {
    const index = progress.solvedQuestions.findIndex(
      (id) => id.toString() === questionId
    );

    if (index === -1) {
      progress.solvedQuestions.push(questionId);

      if (question.difficulty === "Easy")
        progress.easySolved++;

      if (question.difficulty === "Medium")
        progress.mediumSolved++;

      if (question.difficulty === "Hard")
        progress.hardSolved++;

      // ================= STREAK =================
      // Consecutive-day streak: if the last solve was
      // yesterday, extend it; if it was already today,
      // leave it as-is; otherwise (a gap, or first-ever
      // solve) the streak restarts at 1.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!progress.lastSolvedDate) {
        progress.streak = 1;
      } else {
        const lastDate = new Date(progress.lastSolvedDate);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.round(
          (today - lastDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // already solved something today — streak unchanged
        } else if (diffDays === 1) {
          progress.streak += 1;
        } else {
          progress.streak = 1;
        }
      }

      progress.bestStreak = Math.max(
        progress.bestStreak || 0,
        progress.streak
      );

      progress.lastSolvedDate = new Date();

      const date = new Date().toISOString().slice(0, 10);
      progress.activity = progress.activity || [];
      const activityEntry = progress.activity.find(
        (entry) => entry.date === date
      );

      if (activityEntry) {
        activityEntry.count += 1;
      } else {
        progress.activity.push({ date, count: 1 });
      }
    } else {
      progress.solvedQuestions.splice(index, 1);

      if (
        question.difficulty === "Easy" &&
        progress.easySolved > 0
      )
        progress.easySolved--;

      if (
        question.difficulty === "Medium" &&
        progress.mediumSolved > 0
      )
        progress.mediumSolved--;

      if (
        question.difficulty === "Hard" &&
        progress.hardSolved > 0
      )
        progress.hardSolved--;

      const date = new Date().toISOString().slice(0, 10);
      progress.activity = (progress.activity || []).filter((entry) => {
        if (entry.date !== date) return true;
        entry.count = Math.max(0, entry.count - 1);
        return entry.count > 0;
      });

      // Unsolving doesn't touch streak/lastSolvedDate —
      // it shouldn't retroactively break a streak the user
      // already earned that day.
    }

  });

  const updatedProgress = await Progress.findOne({
    user: userId,
  })
    .populate({
      path: "solvedQuestions",
      populate: [
        { path: "topic", select: "name slug icon" },
        { path: "companies", select: "name logo" },
        { path: "sheets", select: "name" },
      ],
    })
    .populate({
      path: "bookmarkedQuestions",
      populate: [
        { path: "topic", select: "name slug icon" },
        { path: "companies", select: "name logo" },
        { path: "sheets", select: "name" },
      ],
    })
    .populate("lastVisitedQuestion");

  return updatedProgress;
};


// ======================================
// Update Last Visited Question
// ======================================

exports.updateLastVisitedQuestion = async (
  userId,
  questionId
) => {
  if (!await Question.exists({ _id: questionId })) throw new Error("Question not found");

  await mutateProgress(userId, progress => {
    progress.lastVisitedQuestion = questionId;

  });

  const updatedProgress = await Progress.findOne({
    user: userId,
  }).populate("lastVisitedQuestion");

  return updatedProgress;
};

// ======================================
// Toggle Bookmark
// ======================================

exports.toggleBookmark = async (
  userId,
  questionId
) => {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  await mutateProgress(userId, progress => {
    const index =
      progress.bookmarkedQuestions.findIndex(
        (id) => id.toString() === questionId
      );

    if (index === -1) {
      progress.bookmarkedQuestions.push(questionId);
    } else {
      progress.bookmarkedQuestions.splice(index, 1);
    }

  });

  const updatedProgress = await Progress.findOne({
    user: userId,
  }).populate({
    path: "bookmarkedQuestions",
    populate: [
      { path: "topic", select: "name slug icon" },
      { path: "companies", select: "name logo" },
      { path: "sheets", select: "name" },
    ],
  });

  return updatedProgress;
};

// ======================================
// Save Notes
// ======================================

exports.saveNotes = async (
  userId,
  questionId,
  content
) => {
  if (typeof content !== "string" || content.length > 20000) throw new Error("Notes must be text with at most 20,000 characters");
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  await mutateProgress(userId, progress => {
    const noteIndex = progress.notes.findIndex(
      (note) =>
        note.question.toString() === questionId
    );

    if (noteIndex === -1) {
      progress.notes.push({
        question: questionId,
        content,
      });
    } else {
      progress.notes[noteIndex].content = content;
    }

  });

  return await Progress.findOne({
    user: userId,
  }).populate("notes.question");
};
// ======================================
// Delete Note
// ======================================

exports.deleteNote = async (
  userId,
  questionId
) => {
  await mutateProgress(userId, progress => {
    progress.notes = progress.notes.filter(
      (note) =>
        note.question.toString() !== questionId
    );

  });

  return await Progress.findOne({
    user: userId,
  }).populate({
    path: "notes.question",
    select: "title slug",
  });
};
