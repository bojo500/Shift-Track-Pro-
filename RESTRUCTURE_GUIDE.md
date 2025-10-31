# ShiftTrackPro Database Restructure Guide

## ✅ Completed Changes

### 1. New Entities Created
- ✅ `role.entity.ts` - Separate Role entity (SuperAdmin, Admin, User)
- ✅ `ccs-record-details.entity.ts` - CCS section-specific fields
- ✅ `baf-record-details.entity.ts` - BAF section-specific fields
- ✅ `slitter-record-details.entity.ts` - Slitter section-specific fields

### 2. Updated Entities
- ✅ `user.entity.ts` - Changed from enum role to role_id (FK to roles table)
- ✅ `record.entity.ts` - Removed crm_in/crm_out, added relations to detail tables

## 🔄 Remaining Changes Needed

### Phase 1: Update Core Configuration

1. **Update `typeorm.config.ts`** to include new entities:
```typescript
entities: [
  User, Role, Section, Shift, Record,
  CcsRecordDetails, BafRecordDetails, SlitterRecordDetails
]
```

2. **Update `app.module.ts`** to register new entities in TypeORM

### Phase 2: Create Roles Module

Create `/src/modules/roles/` with:
- `roles.service.ts`
- `roles.controller.ts`
- `roles.module.ts`
- DTOs for role operations

### Phase 3: Update Seed Script

Update `/src/database/seeds/seed.ts`:

**New Roles:**
- SuperAdmin - Can manage everything
- Admin - Can manage users only
- User (Worker) - Can submit shift reports

**New Sections:**
- CCS (with all 17 fields)
- BAF (with production metrics)
- Slitter (with coil processing data)

**New Shifts:**
- 1st Shift (instead of "Morning Shift")
- 2nd Shift (instead of "Evening Shift")
- 3rd Shift (instead of "Night Shift")

### Phase 4: Create Section-Specific DTOs

Create DTOs for each section in `/src/records/dto/`:

**`create-ccs-record.dto.ts`:**
```typescript
export class CreateCcsRecordDto {
  userId: number;
  sectionId: number;
  shiftId: number;
  bafIn?: number;
  bafOut?: number;
  crmIn?: number;
  crmOut?: number;
  shippedOut?: number;
  tuggerIn?: number;
  tuggerOff?: number;
  totalTrucksIn?: number;
  totalTrucksOut?: number;
  totalMovements?: number;
  totalTrucks?: number;
  hook?: number;
  downTime?: number;
  movedOfShipping?: number;
  slitterOn?: number;
  slitterOff?: number;
  coilsHatted?: number;
  issues?: string;
}
```

**`create-baf-record.dto.ts`** - BAF specific fields
**`create-slitter-record.dto.ts`** - Slitter specific fields

### Phase 5: Update Records Module

Update `/src/records/records.service.ts`:
- Add logic to detect section and save to appropriate detail table
- Create methods: `createCcsRecord()`, `createBafRecord()`, `createSlitterRecord()`
- Update `findAll()` to include detail relations

Update `/src/records/records.controller.ts`:
- Add endpoints for each section type
- Update Swagger documentation

### Phase 6: Update Auth & Users Modules

**Auth Module:**
- Update JWT payload to include `roleId` instead of `role` enum
- Update `login()` to return role information from database

**Users Module:**
- Update DTOs to use `roleId` (number) instead of `role` (enum)
- Update validation
- Update queries to include role relation

### Phase 7: Delete Old Enum

Delete `/src/common/enums/role.enum.ts` (no longer needed)

### Phase 8: Update Frontend

**Context/AuthContext.tsx:**
```typescript
interface User {
  id: number;
  username: string;
  roleId: number;
  role: { id: number; name: string };
  sectionId?: number;
  section?: { id: number; name: string };
}
```

**Update section names in frontend:**
- "Production" → "CCS"
- "Quality Control" → "BAF"
- Remove "Packaging" and "Maintenance"
- Add "Slitter"

**Update shift names:**
- "Morning Shift" → "1st Shift"
- "Evening Shift" → "2nd Shift"
- "Night Shift" → "3rd Shift"

## 🗄️ New Database Schema

### Tables Structure:

```
roles
├── id (PK)
├── name (unique): SuperAdmin | Admin | User
└── description

users
├── id (PK)
├── username (unique)
├── password (hashed)
├── role_id (FK → roles.id)
└── section_id (FK → sections.id, nullable)

sections
├── id (PK)
└── name: CCS | BAF | Slitter

shifts
├── id (PK)
├── name: 1st Shift | 2nd Shift | 3rd Shift
├── start_time
└── end_time

records (base table)
├── id (PK)
├── user_id (FK → users.id)
├── section_id (FK → sections.id)
├── shift_id (FK → shifts.id)
└── created_at

ccs_record_details
├── id (PK)
├── record_id (FK → records.id, unique)
├── baf_in, baf_out, crm_in, crm_out
├── shipped_out, tugger_in, tugger_off
├── total_trucks_in, total_trucks_out
├── total_movements, total_trucks
├── hook, down_time
├── moved_of_shipping
├── slitter_on, slitter_off
├── coils_hatted
└── issues (text)

baf_record_details
├── id (PK)
├── record_id (FK → records.id, unique)
├── production_count
├── defect_count
├── machine_downtime
└── notes (text)

slitter_record_details
├── id (PK)
├── record_id (FK → records.id, unique)
├── coils_processed
├── total_weight
├── scrap_weight
├── blade_changes
└── remarks (text)
```

## 🚀 Migration Strategy

1. **Stop the running application**
2. **Drop existing database**: `docker exec -it shifttrackpro_mysql mysql -uroot -proot -e "DROP DATABASE shifttrackpro; CREATE DATABASE shifttrackpro;"`
3. **Complete all code changes above**
4. **Run the application** - TypeORM will create new schema
5. **Run seed script**: `cd backend && npm run seed`
6. **Test all endpoints**

## 📝 API Endpoints After Restructure

### Records
- `POST /records/ccs` - Create CCS record
- `POST /records/baf` - Create BAF record
- `POST /records/slitter` - Create Slitter record
- `GET /records` - Get all records with details
- `GET /records/my-records` - Get current user's records
- `GET /records/:id` - Get specific record with details
- `PATCH /records/:id` - Update record
- `DELETE /records/:id` - Delete record

### Roles (New)
- `GET /roles` - Get all roles
- `GET /roles/:id` - Get role by ID

## ⚠️ Important Notes

- All passwords remain: `password123` for demo users
- SuperAdmin username: `superadmin`
- Admin username: `admin`
- Worker usernames: `worker1`, `worker2`
- Each worker should be assigned to CCS, BAF, or Slitter section
