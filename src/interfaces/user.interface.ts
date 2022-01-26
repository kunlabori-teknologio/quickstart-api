interface IProject {
  id: string,
}

interface IInvitation {
  id: string;
  projectId: string;
  invitedAt: Date;
}

interface IUserFromGoogle {
  id?: string;
  email?: string;
}

interface IUserFromApple {
  id?: string;
  email?: string;
}
