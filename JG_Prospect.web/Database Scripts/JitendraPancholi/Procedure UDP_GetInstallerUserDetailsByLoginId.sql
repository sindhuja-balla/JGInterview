IF EXISTS(SELECT 1 FROM   INFORMATION_SCHEMA.ROUTINES WHERE  ROUTINE_NAME = 'UDP_GetInstallerUserDetailsByLoginId' AND SPECIFIC_SCHEMA = 'dbo')
  BEGIN
      DROP PROCEDURE UDP_GetInstallerUserDetailsByLoginId
  END
Go
-- =============================================          
-- Author:  Yogesh          
-- Create date: 23 Feb 2017        
-- Updated By : Yogesh    
-- Updated By : Jitendra Pancholi
-- Updated On : 13 Nov 2017    
--     Added applicant status to allow applicant to login.        
-- Updated By : Nand Chavan (Task ID#: REC001-XIII)      
--                  Replace Source with SourceID      
-- Description: Get an install user by email and status.        
-- =============================================        
-- [dbo].[UDP_GetInstallerUserDetailsByLoginId]  'Surmca17@gmail.com'   
Create PROCEDURE [dbo].[UDP_GetInstallerUserDetailsByLoginId]        
 @loginId varchar(50) ,        
 @ActiveStatus varchar(5) = '1',        
 @ApplicantStatus varchar(5) = '2',        
 @InterviewDateStatus varchar(5) = '5',        
 @OfferMadeStatus varchar(5) = '6'        
AS        
BEGIN        
      
 DECLARE @phone varchar(1000) = @loginId      
      
 --REC001-XIII - create formatted phone#      
 IF ISNUMERIC(@loginId) = 1 AND LEN(@loginId) > 5      
 BEGIN      
  SET @phone =  '(' + SUBSTRING(@phone, 1, 3) + ')-' + SUBSTRING(@phone, 4, 3) + '-' + SUBSTRING(@phone, 7, LEN(@phone))      
 END      
          
  SELECT Id,FristName,Lastname,Email,[Address],Designation,[Status],        
   [Password],[Address],Phone,Picture,Attachements,usertype, Picture,IsFirstTime,DesignationID,    
   CASE WHEN  [Status] = '5' THEN [dbo].[udf_IsUserAssigned](tbi.Id) ELSE 0 END AS AssignedSequence    
  FROM tblInstallUsers  AS tbi   
  WHERE         
   (Email = @loginId OR Phone = @loginId  OR Phone = @phone)       
   AND ISNULL(@loginId, '') != ''   AND      
   (        
    [Status] = @ActiveStatus OR         
    [Status] = @ApplicantStatus OR        
    [Status] = @OfferMadeStatus OR         
    [Status] = @InterviewDateStatus  OR
	[Status] = 16  -- InterviewDateExpired,  Added by Jitendra Pancholi 
   )        
      
END