interface IProject {
  id: string,
}

interface IInvite {
  id: string;
  projectId: string;
  invitedAt: Date;
}
