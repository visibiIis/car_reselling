import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let users: User[] = [];

  beforeEach(async () => {
    // Create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("can create an instance of auth service", async () => {
    expect(service).toBeDefined();
  });

  it("creates a new user with a salted and hashed password", async () => {
    const user = await service.signup("asdf@asdf.com", "asdf");

    expect(user.password).not.toEqual("asdf");
    const [salt, hash] = user.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("throws an error if user signs up with email that is in use", async (done) => {
    await service.signup("asff@asdf.com", "asdfsdfsdf");

    try {
      await service.signup("asff@asdf.com", "asdf");
    } catch (err) {
      done();
    }
  });

  it("throws an error if signin is called with an unused email", async (done) => {
    try {
      await service.signin("asd@asd.com", "sdfsdff");
    } catch (err) {
      done();
    }
  });

  it("throws an error in an invalid password is provided", async (done) => {
    await service.signup("asdd@asdd.com", "password");

    try {
      await service.signin("asdd@asdd.com", "password1");
    } catch (err) {
      done();
    }
  });

  it("returns a user if correct password is provided", async () => {
    await service.signup("ddd@ddd.com", "123");

    const user = await service.signin("ddd@ddd.com", "123");
    expect(user).toBeDefined();
  });
});
