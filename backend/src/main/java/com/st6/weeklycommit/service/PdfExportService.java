package com.st6.weeklycommit.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.st6.weeklycommit.model.dto.BlockedItemDto;
import com.st6.weeklycommit.model.dto.DashboardMemberDto;
import com.st6.weeklycommit.model.dto.DashboardTeamDto;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PdfExportService {

    private final ExportDataService exportDataService;

    public PdfExportService(ExportDataService exportDataService) {
        this.exportDataService = exportDataService;
    }

    public byte[] generateTeamReport(UUID teamId) {
        DashboardTeamDto team = exportDataService.getTeamData(teamId);
        List<BlockedItemDto> blockedItems = exportDataService.getBlockedItems(teamId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(15, 76, 92));
            Font subtitleFont = new Font(Font.HELVETICA, 12, Font.NORMAL, Color.GRAY);
            Font headerFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 30, 30));
            Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Font cellBoldFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.DARK_GRAY);

            // Title
            Paragraph title = new Paragraph("Weekly Commit Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                team.teamName() + " — Week of " + LocalDate.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy")),
                subtitleFont
            );
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Member Table
            Paragraph memberHeader = new Paragraph("Team Members", headerFont);
            memberHeader.setSpacingBefore(10);
            memberHeader.setSpacingAfter(10);
            document.add(memberHeader);

            PdfPTable table = new PdfPTable(new float[]{3, 1, 1, 1, 1, 1});
            table.setWidthPercentage(100);

            String[] headers = {"Member", "Items", "SP", "Completed SP", "Blocked", "Completion %"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, cellBoldFont));
                cell.setBackgroundColor(new Color(240, 245, 250));
                cell.setPadding(6);
                table.addCell(cell);
            }

            for (DashboardMemberDto m : team.members()) {
                int pct = m.totalStoryPoints() > 0
                    ? Math.round((float) m.completedStoryPoints() / m.totalStoryPoints() * 100)
                    : 0;
                addCell(table, m.memberName(), cellFont);
                addCell(table, String.valueOf(m.totalItems()), cellFont);
                addCell(table, String.valueOf(m.totalStoryPoints()), cellFont);
                addCell(table, String.valueOf(m.completedStoryPoints()), cellFont);
                addCell(table, String.valueOf(m.blockedItems()), cellFont);
                addCell(table, pct + "%", cellFont);
            }
            document.add(table);

            // Blocked Items
            if (!blockedItems.isEmpty()) {
                Paragraph blockedHeader = new Paragraph("Blocked / At-Risk Items", headerFont);
                blockedHeader.setSpacingBefore(20);
                blockedHeader.setSpacingAfter(10);
                document.add(blockedHeader);

                for (BlockedItemDto item : blockedItems) {
                    String line = "• " + item.itemTitle() + " (" + item.memberName() + ")";
                    if (item.riskNote() != null) line += " — " + item.riskNote();
                    document.add(new Paragraph(line, cellFont));
                }
            }

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
