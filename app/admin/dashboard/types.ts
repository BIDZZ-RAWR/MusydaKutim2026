export interface Panitia {
  id: string
  Email: string
  Password?: string
  Role?: string
}

export interface Peserta {
  id: string
  NamaPeserta: string
  Pimpinan: string
  NIB: string
  StatusVoting: string
}

export interface Candidate {
  id: string
  NamaCalonFormatur: string
  FotoCalonFormatur?: string
  JumlahVote?: number
}

export interface Bilik {
  id: string
  name?: string
  status?: string
  activeVoterName?: string
  activeVoterNIB?: string
  Monitor?: string
  Email?: string
  Handphone?: string
}

export interface LandingContent {
  winnerTitle: string
  winnerSubtitle: string
  winnerHeadingColor: string
  winnerHeadingSize: string
  winnerSubColor: string
  winnerSubSize: string
  totalLabel: string
  totalSub: string
  votedLabel: string
  notVotedLabel: string
  notVotedSuffix: string
  candidateSectionTitle: string
  candidateSectionTitleColor: string
  candidateSectionTitleSize: string
  candidateSubtitle: string
  candidateSubtitleColor: string
  candidateSubtitleSize: string
  candidateBadgePrefix: string
  candidateBadgeBgColor: string
  candidateBadgeTextColor: string
  candidateBadgeFontSize: string
  candidateBadgeShape: "rounded" | "square"
  candidateBadgeTextTransform: "none" | "uppercase" | "capitalize"
  candidateBadgeShadow: boolean
  chartTitle: string
  chartTitleColor: string
  chartTitleSize: string
  chartYAxisLabel: string
  loginLinkText: string
  footerMadeBy: string
  footerCopyright: string
}

export interface LandingStatus {
  utama: boolean
  winner: boolean
}

export interface RolesMap {
  [key: string]: string
}

export interface RoleLabels {
  [key: string]: string
}

export interface ViewStats {
  Jumlah: number
  lastView?: TimestampOrDate
}

export interface TimestampOrDate {
  seconds?: number
  nanoseconds?: number
  toDate?: () => Date
}

export interface EditHistory {
  akun?: string
  ApaYangDiEdit?: string
  timestamp?: TimestampOrDate
}

export interface ConfirmState {
  open: boolean
  title: string
  description?: string
  onConfirm?: () => void | Promise<void>
}

export interface NavItem {
  value: string
  label: string
}

export interface NewPeserta {
  Nama: string
  Pimpinan: string
  NIB: string
}

export interface NewBilik {
  id: string
  name: string
  monitor: string
  email: string
  handphone: string
}

export interface CandidateForm {
  id: string
  name: string
  photo: string
}

export interface RoleOption {
  key: string
  label: string
}
