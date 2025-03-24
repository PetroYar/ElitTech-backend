import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import Survey from "./model/Survey.js";
import Question from "./model/Question.js";
import Answer from "./model/Answer.js";
import User from "./model/User.js";

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@elit.jt7wa.mongodb.net/`
    );

    await User.deleteMany({});
    await Survey.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});

    
    const users = Array.from({ length: 5 }, (_, index) => ({
      username: `user${index}`,
      email: `user${index}@gmail.com`,
      password: bcrypt.hashSync("test123", 7),
    }));

    const savedUsers = await User.insertMany(users);

    
    const surveys = await Promise.all(
      savedUsers.flatMap((user) =>
        Array.from({ length: 5 }, async () => {
          const title = faker.lorem.words(3);
          const survey = new Survey({
            title,
            description: faker.lorem.sentence(),
            slug: title.toLowerCase().replace(/\s+/g, "-"),
            userId: user._id,
            questionCount: 10,
          });
          return await survey.save();
        })
      )
    );

   
    const questions = [];
    for (const survey of surveys) {
      for (let i = 0; i < 5; i++) {
        const question = new Question({
          question: faker.lorem.sentence() + "?",
          type: faker.helpers.arrayElement(["radio", "checkbox", "text"]),
          options:
            faker.helpers.arrayElement(["radio", "checkbox"]) === "text"
              ? []
              : Array.from({ length: 4 }, () => faker.lorem.word()),
          surveyId: survey._id,
        });
        questions.push(await question.save());
      }
    }

    const answers = [];
    for (const user of savedUsers) {
      for (const survey of surveys) {
        const startTime = faker.date.between({
          from: "2025-01-01",
          to: "2025-03-24",
        });
        const endTime = new Date(
          startTime.getTime() + faker.number.int({ min: 300, max: 3600 }) * 1000
        );

        const userAnswers = questions
          .filter((q) => q.surveyId.toString() === survey._id.toString())
          .map((question) => {
            let answer;
            switch (question.type) {
              case "text":
                answer = faker.lorem.sentence();
                break;
              case "radio":
                answer = faker.helpers.arrayElement(question.options);
                break;
              case "checkbox":
                answer = faker.helpers.arrayElements(
                  question.options,
                  faker.number.int({ min: 1, max: 3 })
                );
                break;
            }
            return {
              question: question._id,
              answer,
            };
          });

        const answer = new Answer({
          surveyId: survey._id,
          userId: user._id,
          userAnswers,
          startTime,
          endTime,
        });
        answers.push(await answer.save());
      }
    }

    console.log("Database seeded successfully!");
    console.log(`Created ${savedUsers.length} users`);
    console.log(`Created ${surveys.length} surveys`);
    console.log(`Created ${questions.length} questions`);
    console.log(`Created ${answers.length} answers`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.connection.close();
  }
}

seedDatabase();
