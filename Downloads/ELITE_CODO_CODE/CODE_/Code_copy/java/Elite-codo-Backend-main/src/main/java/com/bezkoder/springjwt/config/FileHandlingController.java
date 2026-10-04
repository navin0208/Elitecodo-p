package com.bezkoder.springjwt.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bezkoder.springjwt.payload.response.FileUploadResDto;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/file")
public class FileHandlingController {

    @PostMapping(value = "/uploadfile", consumes = {"multipart/form-data"})
    public ResponseEntity<FileUploadResDto> fileHandelDemo(
            @RequestParam(value = "uploadfile") MultipartFile file) {
        
        FileUploadResDto fileUploadResDto = new FileUploadResDto();
        File convFile = null;
        
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            
            // Validate file type
            if (!isValidFileType(extension)) {
                fileUploadResDto.setStatus(false);
                fileUploadResDto.setPath("Invalid file type. Allowed: png, txt, jpg, gif, jpeg, pdf, docx, mp4, xlsx, xls, mov, avi");
                return ResponseEntity.badRequest().body(fileUploadResDto);
            }
            
            String filename = StringUtils.cleanPath(originalFilename);
            
            // Create temp file
            convFile = new File(System.getProperty("java.io.tmpdir"), filename);
            try (FileOutputStream fos = new FileOutputStream(convFile)) {
                fos.write(file.getBytes());
            }
            
            System.out.println("Temp file created at: " + convFile.getAbsolutePath());
            
            // Upload to FTP
            boolean uploadSuccess = uploadToFTP(convFile, filename);
            
            if (uploadSuccess) {
                fileUploadResDto.setStatus(true);
                fileUploadResDto.setPath("https://zplusglobalmarketinsights.com/auctionBanksImages/" + filename);
                System.out.println("✅ File uploaded successfully: " + filename);
                return ResponseEntity.ok(fileUploadResDto);
            } else {
                fileUploadResDto.setStatus(false);
                fileUploadResDto.setPath("FTP upload failed - Check FTP credentials and connection");
                System.err.println("❌ FTP upload failed for: " + filename);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(fileUploadResDto);
            }
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            fileUploadResDto.setStatus(false);
            fileUploadResDto.setPath("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(fileUploadResDto);
        } finally {
            // Delete temp file AFTER everything is done
            if (convFile != null && convFile.exists()) {
                if (convFile.delete()) {
                    System.out.println("✅ Temp file deleted successfully: " + convFile.getName());
                } else {
                    System.err.println("❌ Failed to delete temp file: " + convFile.getName());
                }
            }
        }
    }
    
    private boolean isValidFileType(String extension) {
        String[] allowedTypes = {"png", "txt", "jpg", "gif", "jpeg", "pdf", 
                                 "docx", "mp4", "xlsx", "xls", "mov", "avi"};
        for (String type : allowedTypes) {
            if (type.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean uploadToFTP(File file, String filename) {
        String host = "zplusglobalmarketinsights.com";
        int port = 21;
        String user = "kab8f0gfd7hd";
        String pwd = "P@SSw0rd";
        
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connect to FTP server
            ftpClient.connect(host, port);
            int reply = ftpClient.getReplyCode();
            
            if (!FTPReply.isPositiveCompletion(reply)) {
                System.err.println("FTP server refused connection. Reply code: " + reply);
                return false;
            }
            
            // Login
            boolean loginSuccess = ftpClient.login(user, pwd);
            if (!loginSuccess) {
                System.err.println("FTP login failed! Check username/password");
                return false;
            }
            
            System.out.println("✅ Connected to FTP server");
            
            // Set file type and mode
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();
            
            // Change to target directory (create if needed)
            String remoteDir = "public_html/auctionBanksImages";
            boolean dirExists = ftpClient.changeWorkingDirectory(remoteDir);
            if (!dirExists) {
                System.out.println("Directory doesn't exist, creating: " + remoteDir);
                ftpClient.makeDirectory(remoteDir);
                ftpClient.changeWorkingDirectory(remoteDir);
            }
            
            // Upload file
            try (InputStream inputStream = new FileInputStream(file)) {
                boolean stored = ftpClient.storeFile(filename, inputStream);
                if (stored) {
                    System.out.println("✅ FTP upload successful: " + filename);
                    return true;
                } else {
                    System.err.println("❌ FTP storeFile failed. Reply code: " + ftpClient.getReplyCode());
                    return false;
                }
            }
            
        } catch (IOException e) {
            System.err.println("❌ FTP Exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                    System.out.println("FTP disconnected");
                }
            } catch (IOException e) {
                System.err.println("FTP disconnect error: " + e.getMessage());
            }
        }
    }
    
    
    @GetMapping("/test-ftp")
    public ResponseEntity<String> testFTPConnection() {
        String host = "zplusglobalmarketinsights.com";
        int port = 21;
        String user = "kab8f0gfd7hd";
        String pwd = "P@SSw0rd";
        
        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(host, port);
            int reply = ftpClient.getReplyCode();
            
            if (!FTPReply.isPositiveCompletion(reply)) {
                return ResponseEntity.ok("Connection failed. Reply code: " + reply);
            }
            
            boolean login = ftpClient.login(user, pwd);
            if (login) {
                return ResponseEntity.ok("✅ FTP Connection successful!");
            } else {
                return ResponseEntity.ok("❌ Login failed! Check credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.ok("❌ Error: " + e.getMessage());
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException e) {
                // Ignore
            }
        }
    }
}