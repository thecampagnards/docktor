export const path = {
  home: "/",
  admin: "/admin",
  images: "/images",

  market: "/market",
  marketGroup: "/market?group=:groupID",

  groups: "/groups",
  groupsNew: "/groups/new",
  groupsEdit: "/groups/:groupID/edit",
  groupsMore: "/groups/:groupID",
  groupsSummary: "/groups/:groupID/summary",
  groupsContainers: "/groups/:groupID/containers",
  groupsCAdvisor: "/groups/:groupID/cadvisor",
  groupsServices: "/groups/:groupID/services",
  groupsMembers: "/groups/:groupID/members",

  daemons: "/daemons",
  daemonsNew: "/daemons/new",
  daemon: "/daemons/:daemonID",
  daemonsSummary: "/daemons/:daemonID/summary",
  daemonsEdit: "/daemons/:daemonID/edit",
  daemonsContainers: "/daemons/:daemonID/containers",
  daemonsImages: "/daemons/:daemonID/images",
  daemonsCAdvisor: "/daemons/:daemonID/cadvisor",
  daemonsSSH: "/daemons/:daemonID/ssh",

  services: "/services",
  servicesNew: "/services/new",
  servicesEdit: "/services/:serviceID/edit",
  servicesMore: "/services/:serviceID",

  login: "/login",
  profile: "/profile",
  users: "/users",
  usersProfile: "/users/:userID",
  usersNew: "/users/new"
};
