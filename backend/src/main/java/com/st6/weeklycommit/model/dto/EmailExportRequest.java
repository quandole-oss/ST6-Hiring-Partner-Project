package com.st6.weeklycommit.model.dto;

import java.util.List;

public record EmailExportRequest(List<String> recipients, boolean attachPdf) {}
