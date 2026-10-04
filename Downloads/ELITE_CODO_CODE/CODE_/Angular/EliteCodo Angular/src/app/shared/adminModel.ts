export class entranceExamMaster {
    entranceExamId: any;
    standardIds: any;
    entranceExamName: any;
    date: any;
    status: any;
}

export class standardMaster {
    standardId: any;
    entranceExamId: any;
    standardName: any;
    date: any;
    status: any;
}

export class subjectMaster {
    subjectId: any;
    subjectName: any;
    status: any;
    standardId: any;
    entranceExamId: any;
}

export class chapterMaster {
    chapterId: any;
    chapterName: any;
    date: any;
    status: any;
    subjectId: any;
    standardId: any;
    entranceExamId: any;
}

export class topicMaster {
    topicId: any;
    topicName: any;
    entranceExamId: any;
    standardId: any;
    subjectId: any;
    chapterId: any;
    status: any;
    date: any;
}

export class subTopicMaster {
    subTopicId: any;
    subTopicName: any;
    entranceExamId: any;
    standardId: any;
    subjectId: any;
    chapterId: any;
    topicId: any;
    date: any;
    status: any;
}

export class yearOfAppearanceMaster {
    yearOfAppearanceId: any;
    yearOfAppearance: any;
    date: any;
    status: any;
}

export class patternMaster {
    patternId: any;
    patternName: any;
    patternActualName: any;
    status: any;
}

export class questionTypeMaster {
    questionTypeId: any;
    questionType: any;
    date: any;
    status: any;
}