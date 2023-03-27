import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe("UsersController", () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: "sdf@sdf.com",
          password: "sdfsdf",
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: "sdfsdf" } as User]);
      },
      // update: () => { },
      // remove: () => {}
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 2, email, password } as User);
      },
      // signup: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("findAllUsers returns a list of users with the given email", async () => {
    const users = await controller.findAllUsers("sdds@sad.com");

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual("sdds@sad.com");
  });

  it("findUser returns a user with the given id", async () => {
    const user = await controller.findUser("1");

    expect(user).toBeDefined();
  });

  it("findUser throws an error if user with the given d os not found", async (done) => {
    fakeUsersService.findOne = () => null;

    try {
      await controller.findUser("1");
    } catch (err) {
      done();
    }
  });

  it("signin updates session object and returns user", async () => {
    const session = { userId: -10 };

    const user = await controller.signin(
      { email: "sdfsf@sdfd.com", password: "123" },
      session,
    );

    expect(session.userId).toEqual(2);
    expect(user.id).toEqual(2);
  });
});
