export const securityAuditService = {
  async logSecurityEvent(event: string, details: any) {
    console.log('Security event:', event, details);
  },

  async auditSessionTimeout(userId: string) {
    console.log('Session timeout audit for user:', userId);
  }
};
