# YOBO RBAC v2 Specification - Analysis & Test Strategy

**Document:** yobo-rbac-spec-v2.md  
**Analysis Date:** January 7, 2026  
**Analyzed By:** Antigravity AI  
**Purpose:** Test automation strategy for RBAC v2

---

## 📊 Executive Summary

### **What is RBAC v2?**
YOBO's Role-Based Access Control system v2 integrates **tier-based feature gating** with traditional permission-based access control. It covers both client-side (organization users) and backoffice (internal team) access management.

### **Key Innovation: Three-Layer Access Model**
```
User Access = Verification Level + Tier + Permission

1. Verification Level: L1 (Free), L2 (Pro), L2+Sales (Enterprise)
2. Tier: Free, Pro, Enterprise (determines feature availability)
3. Permission: Role-based permission (determines user access within tier)
```

**Access Formula:**  
`User can access feature IF (Tier allows feature) AND (User has permission)`

---

## 🎯 What's New in v2

### **Major Changes from v1**

| Area | v1 | v2 |
|------|----|----|
| **Access Control** | Permission-only | Permission + Tier gating |
| **Client Permissions** | 36 total | **43 total** (+7 new) |
| **Backoffice Permissions** | 32 total | **38 total** (+6 new) |
| **Wallet Permissions** | Not defined | wallet.view, wallet.topup, wallet.transactions |
| **Tier Permissions** | Not defined | tier.view, tier.upgrade, tier.usage |
| **Team Invites** | No tier limits | Tier-based capacity checks |
| **API Endpoints** | 38 total | **48 total** (+10 new) |

### **New Permissions (7 Client-Side)**
1. `wallet.view` - View wallet balance and details
2. `wallet.topup` - Initiate wallet topup
3. `wallet.transactions` - View wallet transaction history
4. `tier.view` - View current tier, limits, and usage
5. `tier.upgrade` - Initiate tier upgrade (start KYB for Pro)
6. `tier.usage` - View detailed tier usage metrics
7. `tier.enterprise.request` - Request Enterprise tier (contact sales)

### **New Permissions (6 Backoffice)**
1. `bo.wallet.view` - View organization wallet details
2. `bo.wallet.freeze` - Freeze wallet (block transactions)
3. `bo.wallet.unfreeze` - Unfreeze wallet
4. `bo.wallet.adjust` - Manual balance adjustment (maker)
5. `bo.wallet.adjust.approve` - Approve balance adjustment (checker)
6. `bo.tier.view` - View organization tier and limits
7. `bo.tier.manage` - Change organization tier (maker)
8. `bo.tier.approve` - Approve tier change (checker)

---

## 👥 Roles Overview

### **Client-Side Roles (5 System Defaults)**

| Role | Permissions | Can Invite | Key Capabilities |
|------|------------|-----------|------------------|
| **Owner** | Full access (43 permissions) | All roles | Transfer ownership, tier upgrade, custom roles |
| **Finance Admin** | Full except ownership (38 permissions) | Approver, Maker, Viewer | Wallet topup, team management, settings |
| **Approver** | Approve transactions (18 permissions) | None | Approve payouts, view reports |
| **Maker** | Create transactions (15 permissions) | None | Create payouts, view ledger |
| **Viewer** | Read-only (12 permissions) | None | View dashboard, transactions, reports |

### **Backoffice Roles (6)**

| Role | Self-Approve | Key Capabilities |
|------|-------------|------------------|
| **Owner** | Yes | Super admin, full access |
| **Admin** | Yes | Full access, manage team |
| **Manager** | No | Department/module lead |
| **Approver** | N/A | Approve tasks created by makers |
| **Maker** | N/A | Create tasks, cannot approve own |
| **Viewer** | N/A | Read-only access |

---

## 🎫 Tier-Based Feature Gating

### **Feature Availability Matrix**

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Team Members** | 2 max | 10 max | Unlimited |
| **Departments** | ✗ | 10 max | Unlimited |
| **Connected Banks** | ✗ | 3 max | Unlimited |
| **Yobo Wallet** | ✗ | ✓ | ✓ |
| **Payouts (UI)** | ✗ | ✓ | ✓ |
| **Bulk Payouts** | ✗ | Up to 500 | Unlimited |
| **API Access** | ✗ | ✗ | ✓ |
| **Custom Roles** | 0 | 10 max | Unlimited |

### **Tier Limits**

| Resource | Free | Pro | Enterprise |
|----------|------|-----|------------|
| Team Members | 2 (including Owner) | 10 | Unlimited |
| Departments | 0 | 10 | Unlimited |
| Connected Banks | 0 | 3 | Unlimited |
| Bulk Payout Records | N/A | 500 per batch | Unlimited |
| Custom Roles | 0 | 10 | Unlimited |

---

## 🔄 Critical User Flows

### **1. Feature Access Check Flow (NEW)**
```
User attempts action (e.g., create payout)
    ↓
Is feature available in org's tier?
    ↓ No → Return 403: "Feature requires Pro tier"
    ↓ Yes
Does user have permission?
    ↓ No → Return 403: "You don't have permission"
    ↓ Yes
Check department scope (if applicable)
    ↓
All checks pass → Allow action
```

### **2. Invite User Flow (Updated for Tier Limits)**
```
Owner/Finance Admin initiates invite
    ↓
Check tier capacity (current members vs tier limit)
    ↓ At capacity → Error: "Team at capacity (X/Y). Upgrade to add more."
    ↓ Capacity available
Enter: Email, Mobile, Role
    ↓
System creates invite (7-day expiry)
    ↓
Invite sent via Email + SMS
    ↓
Invitee accepts → Team count incremented
```

### **3. Backoffice Wallet Adjustment Flow (NEW)**
```
Maker searches for organization
    ↓
Views wallet details (balance, transactions)
    ↓
Initiates adjustment: Amount, Type (credit/debit), Reason
    ↓
Attaches supporting document (mandatory)
    ↓
Task created: Type = wallet.adjust, Status = pending
    ↓
Approver reviews task
    ↓
Approve → Balance adjusted, Audit logged
    ↓
Org notified of adjustment
```

### **4. Backoffice Tier Change Flow (NEW)**
```
Sales confirms Enterprise agreement
    ↓
Maker searches for organization
    ↓
Views current tier and verification level
    ↓
Initiates tier change: New tier, Reason, Agreement reference
    ↓
Task created: Type = tier.change, Status = pending
    ↓
Approver reviews: Verifies agreement, L2 verified
    ↓
Approve → Tier updated, New limits active
    ↓
Org notified, API credentials issued (if Enterprise)
```

---

## 🧪 Test Automation Strategy

### **Test Coverage Areas**

#### **1. Tier-Based Access Control (HIGH PRIORITY)**

**Scenarios to Test:**
- ✅ Free tier user attempts Pro feature → 403 error
- ✅ Pro tier user accesses Pro feature → Success
- ✅ Free tier user views locked features → Lock icon shown
- ✅ Tier upgrade from Free to Pro → Features unlocked
- ✅ API access on non-Enterprise tier → 403 error

**Test Data Needed:**
- Organizations at different tiers (Free, Pro, Enterprise)
- Users with different roles in each tier
- Feature access matrix

#### **2. Permission-Based Access Control (HIGH PRIORITY)**

**Scenarios to Test:**
- ✅ Owner has all 43 permissions
- ✅ Finance Admin has 38 permissions (no ownership.transfer)
- ✅ Approver can approve but not create payouts
- ✅ Maker can create but not approve payouts
- ✅ Viewer has read-only access (12 permissions)
- ✅ Custom role with specific permissions

**Test Data Needed:**
- Users with each role type
- Permission matrix validation
- Custom role templates

#### **3. Tier Limit Enforcement (HIGH PRIORITY)**

**Scenarios to Test:**
- ✅ Invite user when at tier limit → Error
- ✅ Create department at limit (Pro: 10) → Error
- ✅ Connect bank at limit (Pro: 3) → Error
- ✅ Bulk payout exceeds limit (Pro: 500) → Error
- ✅ Create custom role at limit (Pro: 10) → Error

**Test Data Needed:**
- Organizations at capacity for each resource
- Tier limit configurations

#### **4. Wallet Permissions (NEW - HIGH PRIORITY)**

**Scenarios to Test:**
- ✅ User with wallet.view can see balance
- ✅ User without wallet.view gets 403
- ✅ User with wallet.topup can initiate topup
- ✅ Wallet features hidden on Free tier
- ✅ Backoffice can view any org's wallet
- ✅ Backoffice can freeze/unfreeze wallet
- ✅ Backoffice wallet adjustment requires approval

**Test Data Needed:**
- Organizations with wallets (Pro/Enterprise)
- Users with/without wallet permissions
- Backoffice users with wallet permissions

#### **5. Tier Management (NEW - HIGH PRIORITY)**

**Scenarios to Test:**
- ✅ Owner can view tier details
- ✅ Owner can initiate tier upgrade (start KYB)
- ✅ Non-owner cannot upgrade tier
- ✅ Finance Admin can request Enterprise tier
- ✅ Backoffice can change org tier
- ✅ Tier change requires approval
- ✅ Downgrade blocked with over-limit resources

**Test Data Needed:**
- Organizations at different tiers
- KYB completion status
- Tier change workflows

#### **6. Team Invite with Tier Limits (MEDIUM PRIORITY)**

**Scenarios to Test:**
- ✅ Invite succeeds when under limit
- ✅ Invite fails when at capacity
- ✅ Concurrent invites handled correctly
- ✅ Pending invites count toward limit
- ✅ Accept invite when org at limit → Error

**Test Data Needed:**
- Organizations at different team counts
- Pending invites
- Tier limits

#### **7. Custom Roles (MEDIUM PRIORITY)**

**Scenarios to Test:**
- ✅ Owner can create custom role
- ✅ Custom role limited to owner's permissions
- ✅ Custom role can be assigned to users
- ✅ Custom role limit enforced (Pro: 10)
- ✅ Custom role not available on Free tier

**Test Data Needed:**
- Organizations on Pro/Enterprise tier
- Custom role templates
- Permission sets

#### **8. Department Scoping (MEDIUM PRIORITY)**

**Scenarios to Test:**
- ✅ User scoped to department can only access that department
- ✅ User without scope can access all departments
- ✅ Maker scoped to Dept A cannot create payout for Dept B
- ✅ Approver scoped to Dept A cannot approve Dept B payouts

**Test Data Needed:**
- Organizations with multiple departments
- Users with department scopes
- Cross-department transactions

#### **9. Ownership Transfer (LOW PRIORITY)**

**Scenarios to Test:**
- ✅ Owner can transfer ownership
- ✅ New owner must be existing user
- ✅ Transfer requires password + OTP
- ✅ Old owner becomes Viewer
- ✅ New owner gets Owner role
- ✅ Audit log created

**Test Data Needed:**
- Organizations with multiple users
- KYC-verified users
- Transfer workflows

#### **10. Backoffice Maker-Checker (MEDIUM PRIORITY)**

**Scenarios to Test:**
- ✅ Maker creates task (wallet adjust, tier change)
- ✅ Task requires approval
- ✅ Approver can approve/reject task
- ✅ Owner/Admin can self-approve
- ✅ Maker cannot approve own task

**Test Data Needed:**
- Backoffice users with different roles
- Task workflows
- Approval chains

---

## 🎯 Test Scenarios by Priority

### **Priority 1: Critical (Must Test)**
1. Tier-based feature gating (Free vs Pro vs Enterprise)
2. Permission-based access control (all 5 client roles)
3. Tier limit enforcement (team, departments, banks)
4. Wallet permissions (view, topup, transactions)
5. Tier management (view, upgrade, usage)
6. Feature access check flow (tier + permission)

### **Priority 2: Important (Should Test)**
7. Team invite with tier limits
8. Custom roles creation and assignment
9. Department scoping
10. Backoffice wallet management
11. Backoffice tier management
12. Maker-checker workflow

### **Priority 3: Nice to Have (Can Test)**
13. Ownership transfer
14. Permission overrides
15. Role template customization
16. Audit log verification

---

## 📋 API Endpoints to Test

### **New Tier APIs (5 endpoints)**
1. `GET /tier` - Get current tier details
2. `GET /tier/usage` - Get tier usage metrics
3. `GET /tier/features` - Get feature availability
4. `POST /tier/upgrade/start-kyb` - Initiate tier upgrade
5. `POST /tier/enterprise/request` - Request Enterprise tier

### **New Backoffice Wallet APIs (4 endpoints)**
6. `GET /backoffice/wallets/{org_id}` - View org wallet
7. `POST /backoffice/wallets/{org_id}/freeze` - Freeze wallet
8. `POST /backoffice/wallets/{org_id}/unfreeze` - Unfreeze wallet
9. `POST /backoffice/wallets/{org_id}/adjust` - Adjust wallet balance

### **New Backoffice Tier APIs (2 endpoints)**
10. `GET /backoffice/organizations/{org_id}/tier` - View org tier
11. `POST /backoffice/organizations/{org_id}/tier/change` - Change org tier

### **Updated User Management API (1 endpoint)**
12. `POST /users/invite` - Now checks tier capacity

---

## 🧩 Test Data Requirements

### **Organizations**
- Free tier org (2 members, no departments, no banks)
- Pro tier org (10 members, 10 departments, 3 banks)
- Enterprise tier org (unlimited resources)
- Org at team capacity (Free: 2/2, Pro: 10/10)
- Org at department limit (Pro: 10/10)
- Org at bank limit (Pro: 3/3)

### **Users**
- Owner (full access)
- Finance Admin (38 permissions)
- Approver (18 permissions)
- Maker (15 permissions)
- Viewer (12 permissions)
- Custom role user
- Department-scoped user

### **Backoffice Users**
- Backoffice Owner
- Backoffice Admin
- Backoffice Manager
- Backoffice Approver
- Backoffice Maker
- Backoffice Viewer

### **Wallets**
- Wallet with balance (Pro/Enterprise)
- Frozen wallet
- Wallet with pending topup
- Wallet with transaction history

### **Tiers**
- Free tier (L1 verification)
- Pro tier (L2 verification)
- Enterprise tier (L2 + Sales agreement)

---

## 🚨 Edge Cases to Test

### **Tier Gating Edge Cases**
1. Access Pro feature on Free tier → 403 error
2. Create payout with no wallet → 403 error
3. API call on non-Enterprise → 403 error
4. Department create at limit → 403 error
5. Connect bank at limit → 403 error
6. View locked feature → Show preview with lock icon

### **Team Invite Edge Cases**
7. Invite when at tier limit → 403 error
8. Accept invite when org at limit → 403 error
9. Pending invites + current = over limit → Allow invite, check at acceptance
10. Downgrade with over-limit team → Block downgrade
11. Concurrent invites exceeding limit → Only first processed

### **Wallet Operations Edge Cases**
12. Freeze already frozen wallet → 400 error
13. Adjust frozen wallet → 403 error
14. Adjustment exceeds balance (debit) → 400 error
15. Missing document for adjustment → 400 error

### **Tier Change Edge Cases**
16. Upgrade to Pro without L2 → 403 error
17. Upgrade to Enterprise without L2 → 403 error
18. Downgrade Enterprise with API keys → Warning
19. Downgrade with over-limit resources → Error

### **Role & Permission Edge Cases**
20. Grant permission not owned → Error
21. Delete role with users → Error
22. Edit owner role → Error
23. Max custom roles (10) → Error
24. Remove owner → Error

---

## 📊 Audit Events to Verify

### **New RBAC Events (11 new)**
1. `tier.viewed` - User viewed tier details
2. `tier.upgrade.initiated` - Tier upgrade started
3. `tier.upgrade.completed` - Tier upgrade finished
4. `tier.enterprise.requested` - Enterprise tier requested
5. `tier.changed` - Tier changed by backoffice
6. `wallet.viewed` - Wallet viewed by backoffice
7. `wallet.frozen` - Wallet frozen
8. `wallet.unfrozen` - Wallet unfrozen
9. `wallet.adjusted` - Wallet balance adjusted
10. `team.limit.reached` - Team capacity reached
11. `feature.access.denied` - Feature access denied (tier/permission)

---

## 🎯 Recommended Test Implementation

### **Phase 1: Core Tier & Permission Testing (Week 1-2)**
1. Create test data factory for organizations (Free, Pro, Enterprise)
2. Create test data factory for users (all 5 roles)
3. Implement tier-based access control tests
4. Implement permission-based access control tests
5. Implement tier limit enforcement tests

### **Phase 2: New Features Testing (Week 3-4)**
6. Implement wallet permission tests
7. Implement tier management tests
8. Implement team invite with limits tests
9. Implement backoffice wallet tests
10. Implement backoffice tier tests

### **Phase 3: Edge Cases & Audit (Week 5-6)**
11. Implement all edge case tests
12. Implement audit log verification
13. Implement custom role tests
14. Implement department scoping tests
15. Implement maker-checker workflow tests

---

## 📚 Documentation for Test Team

### **Key Concepts to Understand**
1. **Three-Layer Access Model**: Verification Level + Tier + Permission
2. **Access Formula**: Feature access requires BOTH tier AND permission
3. **Tier Limits**: Free (2 members), Pro (10 members), Enterprise (unlimited)
4. **Maker-Checker**: Backoffice actions require approval (except Owner/Admin)
5. **Department Scoping**: Users can be limited to specific departments

### **Testing Best Practices**
1. Always test with organizations at different tiers
2. Test with users having different roles
3. Verify both positive and negative scenarios
4. Check audit logs for all permission changes
5. Test tier limit enforcement at boundaries (e.g., 9/10, 10/10)
6. Test concurrent operations (e.g., multiple invites)

---

## 🎉 Summary

### **Test Coverage Metrics**
- **Total Permissions**: 81 (43 client + 38 backoffice)
- **Total Roles**: 11 (5 client + 6 backoffice)
- **Total API Endpoints**: 48 (+10 new)
- **Total Audit Events**: 22 (+11 new)
- **Tier Levels**: 3 (Free, Pro, Enterprise)

### **Estimated Test Cases**
- **Tier-based access**: ~50 test cases
- **Permission-based access**: ~100 test cases
- **Tier limits**: ~30 test cases
- **Wallet permissions**: ~40 test cases
- **Tier management**: ~30 test cases
- **Edge cases**: ~50 test cases
- **Audit verification**: ~20 test cases

**Total Estimated**: ~320 test cases

### **Recommended Approach**
1. Start with API tests for tier and permission validation
2. Add E2E tests for critical user flows
3. Implement edge case tests
4. Add audit log verification
5. Continuous testing as features are developed

---

**Document Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Ready for Test Implementation  
**Next Steps:** Create test data factories and begin Phase 1 testing
