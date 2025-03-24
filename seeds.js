import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

import Survey from "./model/Survey.js";
import Question from "./model/Question.js";
import Answer from "./model/Answer.js";
import User from "./model/User.js";

async function seedDatabase() {
  try {
    // Підключення до MongoDB
    await mongoose.connect(
      "mongodb+srv://test:LKyfV132pV0F6vPt@cluster0.30gq2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    // Очищення попередніх даних
    await User.deleteMany({});
    await Survey.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});

    // 1. Створення 10 користувачів
    const users = Array.from({ length: 20 }, (_, index) => ({
      username: `user${index}`, // Генеруємо username у форматі user0, user1, ...
      email: `user${index}@gmail.com`,
      password: bcrypt.hashSync("test123", 7),
    }));

    const savedUsers = await User.insertMany(users);

    // 2. Створення 10 опитувань (по одному від кожного користувача)
    const surveys = await Promise.all(
      savedUsers.map(async (user) => {
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
    );

    // 3. Створення 10 питань для кожного опитування (з 4 варіантами відповідей)
    const questions = [];
    for (const survey of surveys) {
      for (let i = 0; i < 10; i++) {
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

    // 4. Створення відповідей (кожен користувач відповідає на всі опитування)
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

    // Закриття підключення
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.connection.close();
  }
}

// Запуск seed
seedDatabase();
