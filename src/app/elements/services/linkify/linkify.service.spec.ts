import { TestBed } from '@angular/core/testing';

import { LinkifyService } from './linkify.service';

describe('LinkifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LinkifyService = TestBed.get(LinkifyService);
    expect(service).toBeTruthy();
  });
});
