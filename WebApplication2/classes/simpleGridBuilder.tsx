import * as React from 'react';
import { Dtos } from '../adr';
import { Pending, PageableGridBuilder } from '../classes';

/**
 * @class SimpleGridBuilder
 * Wrapper class for using the pagedGridBuilder with no server-side paging, fitering or sorting.
 * All those operations happen client-side with this grid builder.
 * When using this builder, remember to enter NULL, or () => NULL, for the arguments of addString, addNumber, etc. (where appropriate)
 */
export class SimpleGridBuilder {
    private static prepareData<T>(dto: T[], pageSize?: number): Dtos.PagedResultDto<T> {
        return {
            pageSize: !!pageSize ? pageSize : null,
            page: 1,
            totalPages: 1,
            count: dto.length,
            totalCount: dto.length,
            items: dto
        }
    }

    public static For<T>(dto: T[], pageSize?: number) {
        let gridData = SimpleGridBuilder.prepareData(dto, pageSize);
        return PageableGridBuilder.ForPage(gridData.pageSize, gridData, (options) => null).isSimpleGrid();
    }

    public static ForPending<T>(dto: Pending<T[]>, pageSize?: number) {
        dto = dto || new Pending<T[]>();
        let gridData = dto.map(x => SimpleGridBuilder.prepareData(x, pageSize));
        return PageableGridBuilder.ForPendingPage(!!pageSize ? pageSize : null, dto.map(x => this.prepareData(x)), (options) => null).isSimpleGrid();
    }
}