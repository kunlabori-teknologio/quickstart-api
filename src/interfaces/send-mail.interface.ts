export interface ISendMail {
  sendInvitationMail(
    invitationId: string,
    emailOfInvited: string,
    project?: string,
  ): string | null;
}
