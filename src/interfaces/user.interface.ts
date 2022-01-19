interface IProject {
  id: string,
}

interface IInvitation {
  id: string;
  projectId: string;
  invitedAt: Date;
}
