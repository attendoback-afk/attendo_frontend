export type LiveSessionStatus = "ACTIVE" | "CLOSED" | "EXPIRED" | string;

export type LiveSessionStart = {
  sessionId: string;
  academicSessionId: number;
  secret?: string;
  startTime: string;
};

export type LiveQrToken = {
  token: string;
  secret?: string;
  expiresAt?: string;
  expiresIn?: number;
};

export type LiveSessionListItem = {
  id: string;
  staffId: string | number;
  secret: string;
  status: LiveSessionStatus;
  startTime: string;
  endTime?: string | null;
  createdAt: string;
  _count?: {
    markedAttendances?: number;
  };
};

export type LiveSessionSummary = {
  id: string;
  status: LiveSessionStatus;
  startTime: string;
  endTime?: string | null;
  totalMarked: number;
};

export type LiveAttendanceRecord = {
  id: string | number;
  studentId: string | number;
  attendanceSessionId: string;
  markedAt: string;
  student?: {
    userId: string | number;
    classId: string | number;
    studentCode: string;
    imageUrl?: string | null;
    faceRegistered: boolean;
    user?: {
      fullName: string;
      email: string;
    };
  };
};

export type LiveSessionRecordsResponse = {
  session: LiveSessionSummary;
  records: LiveAttendanceRecord[];
};

export type LiveQrPayload = {
  sessionId: string;
  token: string;
};
