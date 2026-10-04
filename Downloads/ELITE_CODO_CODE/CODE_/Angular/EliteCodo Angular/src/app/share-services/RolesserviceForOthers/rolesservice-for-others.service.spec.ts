import { TestBed } from '@angular/core/testing';

import { RolesserviceForOthersService } from './rolesservice-for-others.service';

describe('RolesserviceForOthersService', () => {
  let service: RolesserviceForOthersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolesserviceForOthersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
