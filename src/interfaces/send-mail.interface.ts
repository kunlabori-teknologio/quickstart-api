export interface ISendMail {
  sendInvitationMail(invitationId: string, emailOfInvited: string): string | null,
}
